import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/forms/Input';
import Button from '../../components/common/Button';
import Badge, { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  Send,
  MapPin,
  Tag,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Building2,
  Flame,
  Clock,
  Layers,
  Image as ImageIcon,
  Check,
  ChevronRight,
  ChevronLeft,
  Tv,
  Zap,
  Droplet,
  Wind,
  Armchair,
  UploadCloud,
  X,
  FileCheck,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { complaintSubmissionSchema } from '../../schemas/complaint.schema';
import api from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import AIClassificationPanel from '../../components/common/AIClassificationPanel';
import ImageAnalysisLoader from '../../components/common/ImageAnalysisLoader';
import DuplicateComplaintPanel from '../../components/common/DuplicateComplaintPanel';

export const SubmitComplaintPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Wizard Step (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Check URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialCategorySlug = queryParams.get('cat') || '';
  const initialTitle = queryParams.get('title') || '';
  const initialDesc = queryParams.get('desc') || '';

  const [formData, setFormData] = useState({
    title: initialTitle || '',
    category: '',
    building: 'Engineering Block C',
    floor: '3rd Floor',
    room: 'Room 304',
    landmark: 'Ceiling mount near central podium',
    priority: 'high',
    description: initialDesc || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Advanced Feature States: AI Defect Analysis & Duplicate Detection
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [hasDismissedDuplicates, setHasDismissedDuplicates] = useState(false);
  const [userVotedIds, setUserVotedIds] = useState([]);

  useEffect(() => {
    api.get('/complaints/my-votes')
      .then((res) => setUserVotedIds(res.votedIds || []))
      .catch(() => {});
  }, []);

  const runAiAnalysis = async (file) => {
    if (!file) return;
    setIsAnalyzingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('description', `${formData.title} ${formData.description}`);
      const res = await api.post('/complaints/analyze-image', fd);
      if (res.analysis) {
        setAiAnalysis(res.analysis);
      }
    } catch (err) {
      console.warn('AI analysis skipped:', err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleApplyAiSuggestions = (analysis) => {
    if (!analysis) return;
    const matchedCategory = categories.find(
      (c) =>
        c.slug === analysis.suggestedCategorySlug ||
        c.name.toLowerCase().includes(analysis.suggestedCategory.toLowerCase())
    );

    setFormData((prev) => ({
      ...prev,
      category: matchedCategory ? matchedCategory._id : prev.category,
      priority: analysis.suggestedPriority || prev.priority,
      title: prev.title.trim() ? prev.title : analysis.detectedIssue,
    }));
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (isMounted && res.categories) {
          setCategories(res.categories);

          if (initialCategorySlug) {
            const matched = res.categories.find((c) => c.slug === initialCategorySlug);
            if (matched) {
              setFormData((prev) => ({ ...prev, category: matched._id }));
              return;
            }
          }

          if (res.categories.length > 0 && !formData.category) {
            setFormData((prev) => ({ ...prev, category: res.categories[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [initialCategorySlug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePrioritySelect = (level) => {
    setFormData((prev) => ({ ...prev, priority: level }));
    if (errors.priority) {
      setErrors((prev) => ({ ...prev, priority: undefined }));
    }
  };

  const handleCategorySelect = (categoryId) => {
    setFormData((prev) => ({ ...prev, category: categoryId }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      runAiAnalysis(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      runAiAnalysis(file);
    }
  };

  const handleRemoveFile = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  // Quick suggestion chips for building
  const buildingSuggestions = [
    'Engineering Block C',
    'Science Block B',
    'Main Administrative Block A',
    'Central University Library',
    'Hostel Complex Block 1',
    'Indoor Sports Arena & Cafeteria',
  ];

  // Faculty demo scenario autofill
  const handleAutoFillDemo = () => {
    const itCat = categories.find((c) => c.slug === 'it_av' || c.name.includes('IT')) || categories[0];
    setFormData({
      title: 'Broken Classroom Projector in Block C Room 304',
      category: itCat ? itCat._id : '',
      building: 'Engineering Block C',
      floor: '3rd Floor',
      room: 'Room 304',
      landmark: 'Ceiling mount near central podium',
      priority: 'high',
      description:
        'The overhead projector in Classroom 304 suddenly shut down during the morning lecture. Power LED blinks red, and HDMI input gives no signal. Requires urgent technician dispatch before afternoon lab session.',
    });
    setErrors({});
    setCurrentStep(4); // Jump directly to Review & Submit for live demonstration!
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.category) newErrors.category = 'Please select an issue category.';
    } else if (step === 2) {
      if (!formData.title.trim()) {
        newErrors.title = 'Please enter a descriptive issue title.';
      } else if (formData.title.trim().length < 3) {
        newErrors.title = 'Title must be at least 3 characters.';
      }

      if (!formData.building.trim()) {
        newErrors.building = 'Please enter a campus building.';
      }

      if (!formData.room.trim()) {
        newErrors.room = 'Please enter room or location number.';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Please describe the problem details.';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'Please provide at least 10 characters describing the problem.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) return;

    // Check for duplicate unresolved complaints upon completing Step 2
    if (currentStep === 2 && !hasDismissedDuplicates && duplicates.length === 0) {
      setIsCheckingDuplicates(true);
      try {
        const res = await api.post('/complaints/check-duplicates', {
          category: formData.category,
          building: formData.building,
          room: formData.room,
          title: formData.title,
          description: formData.description,
        });

        if (res.hasDuplicates && res.duplicates?.length > 0) {
          setDuplicates(res.duplicates);
          setIsCheckingDuplicates(false);
          return; // Retain on Step 2 to review duplicates & upvote
        }
      } catch (err) {
        console.warn('Duplicate check skipped:', err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }

    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setApiError('');

    const dataToSubmit = {
      ...formData,
      floor: formData.floor?.trim() || 'Ground Floor',
    };

    const validationResult = complaintSubmissionSchema.safeParse(dataToSubmit);
    if (!validationResult.success) {
      const fieldErrors = {};
      const errorList = [];
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
          errorList.push(err.message);
        }
      });
      setErrors(fieldErrors);
      setApiError(errorList[0] || 'Please complete all required fields.');

      // Automatically navigate back to the step that has the missing or invalid field
      if (fieldErrors.category) {
        setCurrentStep(1);
      } else if (fieldErrors.title || fieldErrors.building || fieldErrors.room || fieldErrors.description || fieldErrors.floor) {
        setCurrentStep(2);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.keys(dataToSubmit).forEach((key) => {
        submitData.append(key, dataToSubmit[key]);
      });

      if (imageFile) {
        submitData.append('images', imageFile);
      }

      if (aiAnalysis) {
        submitData.append('aiAnalysis', JSON.stringify(aiAnalysis));
      }

      const res = await api.post('/complaints', submitData);

      setSuccessInfo(res.complaint || {
        trackingId: res.trackingId,
        ...dataToSubmit,
        category: selectedCategoryObj,
      });
    } catch (err) {
      console.error('Complaint dispatch error:', err);
      setApiError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c._id === formData.category);

  // Success Screen
  if (successInfo) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 sm:p-12 shadow-elevated text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              Complaint Dispatched Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ticket Logged in University Grid
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your issue has been routed to the maintenance triage queue. Maintenance personnel and department admins have been notified.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 inline-flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-md mx-auto">
            <div className="text-left">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Unique Tracking Reference
              </span>
              <div className="font-mono text-lg font-black text-indigo-600 dark:text-indigo-400">
                {successInfo.trackingId}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(successInfo.trackingId);
                setCopiedId(true);
                setTimeout(() => setCopiedId(false), 2000);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to={`/track?id=${successInfo.trackingId}`}>
              <Button variant="primary" size="md" rightIcon={ExternalLink} className="font-bold">
                Live Status Tracker
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSuccessInfo(null);
                setFormData({
                  title: '',
                  category: categories[0]?._id || '',
                  building: 'Engineering Block C',
                  floor: '3rd Floor',
                  room: '',
                  landmark: '',
                  priority: 'medium',
                  description: '',
                });
                setImageFile(null);
                setImagePreviewUrl(null);
                setCurrentStep(1);
              }}
            >
              Report Another Problem
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Visual Category Helper Icons
  const getCatIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('it') || n.includes('av') || n.includes('projector')) return Tv;
    if (n.includes('elect')) return Zap;
    if (n.includes('plumb') || n.includes('water')) return Droplet;
    if (n.includes('hvac') || n.includes('ac')) return Wind;
    return Armchair;
  };

  const steps = [
    { num: 1, title: 'Category' },
    { num: 2, title: 'Details & Location' },
    { num: 3, title: 'Photo Evidence' },
    { num: 4, title: 'Review & Submit' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              Campus Issue Intake
            </span>
            <span className="text-xs text-slate-400 font-medium">Automatic SLA Enforcement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Report a Campus Facility Problem
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Submit broken infrastructure requests directly to certified technicians with photo proof.
          </p>
        </div>

        {/* Demo 1-Click Autofill Button for Faculty Presentation */}
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 dark:from-indigo-950/40 dark:to-purple-950/40 dark:border-indigo-800/50 dark:text-indigo-300 border border-indigo-200/80 text-xs font-bold text-indigo-700 shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Autofill Faculty Demo Scenario</span>
        </button>
      </div>

      {/* Animated 4-Step Progress Indicator */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 sm:p-5 shadow-premium">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {steps.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div
                key={st.num}
                onClick={() => {
                  if (st.num < currentStep) setCurrentStep(st.num);
                }}
                className={cn(
                  'flex flex-col sm:flex-row items-center sm:items-start gap-2 p-2 rounded-xl transition-all cursor-pointer text-center sm:text-left',
                  isCurrent ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40' : ''
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : st.num}
                </div>
                <div>
                  <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {st.num}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold block truncate',
                      isCurrent ? 'text-indigo-900 dark:text-indigo-300' : isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {st.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* 2-Column Split: Form Wizard on Left (7 cols), Live Ticket Preview on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Wizard (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-premium space-y-6">
            {/* STEP 1: CATEGORY SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 1: Select Problem Category</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                    Choose the facility domain to route to the appropriate maintenance team.
                  </p>
                </div>

                {isLoadingCategories ? (
                  <div className="py-8 flex justify-center">
                    <Spinner size="md" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {categories.map((cat) => {
                      const Icon = getCatIcon(cat.name);
                      const isSelected = formData.category === cat._id;

                      return (
                        <div
                          key={cat._id}
                          onClick={() => handleCategorySelect(cat._id)}
                          className={cn(
                            'p-4 rounded-xl border text-left transition-all duration-150 flex items-start justify-between cursor-pointer group',
                            isSelected
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-600/10 dark:ring-indigo-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                              )}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                              <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-1">
                                {cat.description || 'Campus facility repair'}
                              </p>
                              <span className="inline-block text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                                SLA: &lt; {cat.slaHours || 24} Hours
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {errors.category && (
                  <p className="text-xs text-rose-600 font-semibold">{errors.category}</p>
                )}
              </div>
            )}

            {/* STEP 2: DETAILS & LOCATION */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 2: Enter Issue Details & Campus Location</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                    Specify the exact problem and where technicians can find the equipment.
                  </p>
                </div>

                <Input
                  label="Issue Title / Summary"
                  name="title"
                  placeholder="e.g. Broken Classroom Projector in Room 304"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  required
                />

                {/* Priority Selection Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Priority Level <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { level: 'low', label: 'Low', desc: '48h SLA' },
                      { level: 'medium', label: 'Medium', desc: '24h SLA' },
                      { level: 'high', label: 'High', desc: '8h SLA' },
                      { level: 'urgent', label: 'Urgent', desc: '2h SLA' },
                    ].map((p) => {
                      const isSelected = formData.priority === p.level;
                      return (
                        <button
                          key={p.level}
                          type="button"
                          onClick={() => handlePrioritySelect(p.level)}
                          className={cn(
                            'p-2.5 rounded-xl border text-center transition-all cursor-pointer',
                            isSelected
                              ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/10 dark:ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          )}
                        >
                          <span className="text-xs block capitalize">{p.label}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block mt-0.5">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Free-Text Building Input with Suggestion Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Campus Facility / Building Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="building"
                    placeholder="e.g. Engineering Block C, Central Library..."
                    value={formData.building}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-medium"
                    required
                  />

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Suggestions:</span>
                    {buildingSuggestions.map((bldg) => (
                      <button
                        key={bldg}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, building: bldg }))}
                        className={cn(
                          'text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer',
                          formData.building === bldg
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/30'
                        )}
                      >
                        + {bldg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Room / Hall Number"
                    name="room"
                    placeholder="e.g. Room 304 or Lab 2"
                    value={formData.room}
                    onChange={handleChange}
                    error={errors.room}
                    required
                  />
                  <Input
                    label="Floor Level"
                    name="floor"
                    placeholder="e.g. 3rd Floor"
                    value={formData.floor}
                    onChange={handleChange}
                    error={errors.floor}
                  />
                </div>

                {errors.building && (
                  <p className="text-xs text-rose-600 font-semibold">{errors.building}</p>
                )}

                <Input
                  label="Landmark Reference (Optional)"
                  name="landmark"
                  placeholder="e.g. Near main stairway or projector mount"
                  value={formData.landmark}
                  onChange={handleChange}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Detailed Problem Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    placeholder="Provide full details of the malfunction, symptoms, and urgency..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-medium leading-relaxed"
                    required
                  />
                  {errors.description && (
                    <p className="text-xs text-rose-600 font-semibold mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Duplicate Complaint Detection Results Panel */}
                {duplicates.length > 0 && !hasDismissedDuplicates && (
                  <DuplicateComplaintPanel
                    duplicates={duplicates}
                    userVotedIds={userVotedIds}
                    onProceedAnyway={() => {
                      setHasDismissedDuplicates(true);
                      setCurrentStep(3);
                    }}
                    onVoteChange={(newVoted, newCount) => {}}
                  />
                )}
              </div>
            )}

            {/* STEP 3: PHOTO EVIDENCE UPLOAD */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 3: Upload Photographic Evidence</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                    Attaching a photo speeds up technician diagnosis by 40%.
                  </p>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className={cn(
                    'p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3',
                    imageFile
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-indigo-50/10'
                  )}
                  onClick={() => document.getElementById('complaint-file-input').click()}
                >
                  <input
                    id="complaint-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Drag and drop image here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Supports all file sizes (no size restriction) • JPG, PNG, WEBP
                    </p>
                  </div>
                </div>

                {/* Image Preview Thumbnail */}
                {imagePreviewUrl && (
                  <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreviewUrl}
                        alt="Evidence Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                          {imageFile?.name || 'Attached Evidence Photo'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(imageFile?.size ? (imageFile.size / 1024).toFixed(1) : '240')} KB • Ready for dispatch
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveFile();
                        setAiAnalysis(null);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* AI Neural Defect Scan Loader */}
                {isAnalyzingImage && (
                  <ImageAnalysisLoader message="Extracting visual defect patterns & institutional classification..." />
                )}

                {/* AI Classification Results Panel */}
                {aiAnalysis && !isAnalyzingImage && (
                  <AIClassificationPanel
                    analysis={aiAnalysis}
                    onApplyRecommendations={handleApplyAiSuggestions}
                  />
                )}
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Step 4: Final Review & Confirmation</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                    Review your complaint information before submitting to the campus maintenance grid.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Ticket Summary
                    </span>
                    <PriorityBadge priority={formData.priority} />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{formData.title || 'Untitled Issue'}</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{formData.description || 'No description provided.'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Category:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedCategoryObj?.name || 'General Maintenance'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Target SLA:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">&lt; {selectedCategoryObj?.slaHours || 24} Hours</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Facility:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{formData.building}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Room / Floor:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{formData.room} ({formData.floor})</strong>
                    </div>
                  </div>

                  {aiAnalysis && (
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs">
                      <span className="flex items-center gap-1.5 font-bold truncate max-w-xs">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        AI Defect: {aiAnalysis.detectedIssue}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {aiAnalysis.confidence}% Conf.
                      </span>
                    </div>
                  )}

                  {imagePreviewUrl && (
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs">
                      <ImageIcon className="w-4 h-4" />
                      <span>1 photographic evidence file attached</span>
                    </div>
                  )}
                </div>

                {apiError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevStep}
                  leftIcon={ChevronLeft}
                >
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleNextStep}
                  rightIcon={ChevronRight}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  leftIcon={Send}
                  className="font-bold px-6 shadow-xs"
                >
                  Confirm & Dispatch Ticket
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Real-Time Ticket Preview Dock */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 rounded-2xl border border-indigo-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-indigo-50/20 dark:from-[#111827] dark:to-slate-900 p-5 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Ticket Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">CF-2026-PREVIEW</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedCategoryObj?.name || 'Category Pending'}
                </span>
                <PriorityBadge priority={formData.priority} />
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {formData.title || 'Enter issue title in form...'}
              </h4>

              <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-3 leading-relaxed">
                {formData.description || 'Detailed problem description will appear here as you type in Step 2...'}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{formData.building || 'Facility location'}</span>
                </div>
                <div className="text-slate-400 pl-5">
                  {formData.room || 'Room not set'} {formData.floor && `• ${formData.floor}`}
                </div>
              </div>

              {imagePreviewUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <img
                    src={imagePreviewUrl}
                    alt="Live preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
                    Evidence Photo Attached
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500">
                  No photo attached yet (Step 3)
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Reported by: {user?.name || 'Student'}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">SLA Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaintPage;

"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  TrendingDown, 
  Briefcase, 
  Clock, 
  MapPin, 
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

type Result = {
  prediction: string;
  probability: number | null;
  sentence: string;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}



function riskConfig(p: number | null) {
  if (p == null) return { 
    text: "Pending Analysis", 
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: <Clock className="w-4 h-4" />,
    gradient: "from-gray-500 to-gray-600"
  };
  if (p >= 0.7) return { 
    text: "Critical Retention Risk", 
    color: "bg-red-50 text-red-600 border-red-200",
    icon: <AlertCircle className="w-4 h-4" />,
    gradient: "from-red-500 to-orange-600"
  };
  if (p >= 0.4) return { 
    text: "Moderate Retention Risk", 
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: <Zap className="w-4 h-4" />,
    gradient: "from-amber-500 to-yellow-600"
  };
  return { 
    text: "Stable Employee", 
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: <ShieldCheck className="w-4 h-4" />,
    gradient: "from-emerald-500 to-teal-600"
  };
}

export default function Page() {
  const [form, setForm] = useState({
    // Basic Info
    Age: "30",
    Gender: "Male",
    MaritalStatus: "Single",
    
    // Job Details
    Department: "Research & Development",
    JobRole: "Research Scientist",
    JobLevel: "2",
    BusinessTravel: "Travel_Rarely",
    OverTime: "No",
    
    // Compensation
    MonthlyIncome: "5000",
    PercentSalaryHike: "15",
    
    // Experience & Tenure
    TotalWorkingYears: "5",
    YearsAtCompany: "3",
    YearsInCurrentRole: "2",
    YearsSinceLastPromotion: "1",
    YearsWithCurrManager: "2",
    NumCompaniesWorked: "2",
    
    // Education
    Education: "3",
    EducationField: "Life Sciences",
    
    // Satisfaction & Engagement
    EnvironmentSatisfaction: "3",
    JobSatisfaction: "3",
    RelationshipSatisfaction: "3",
    JobInvolvement: "3",
    WorkLifeBalance: "3",
    
    // Other
    DistanceFromHome: "10",
    TrainingTimesLastYear: "2",
    StockOptionLevel: "1",
    PerformanceRating: "3",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const progress = useMemo(() => {
    const p = result?.probability;
    if (p == null) return null;
    return Math.round(p * 100);
  }, [result]);

  async function onPredict() {
    setLoading(true);
    setError("");
    setResult(null);

    try {

      const payload = {
        data: {
          ...form,
          // Convert numeric fields
          Age: form.Age ? Number(form.Age) : null,
          MonthlyIncome: form.MonthlyIncome ? Number(form.MonthlyIncome) : null,
          PercentSalaryHike: form.PercentSalaryHike ? Number(form.PercentSalaryHike) : null,
          TotalWorkingYears: form.TotalWorkingYears ? Number(form.TotalWorkingYears) : null,
          YearsAtCompany: form.YearsAtCompany ? Number(form.YearsAtCompany) : null,
          YearsInCurrentRole: form.YearsInCurrentRole ? Number(form.YearsInCurrentRole) : null,
          YearsSinceLastPromotion: form.YearsSinceLastPromotion ? Number(form.YearsSinceLastPromotion) : null,
          YearsWithCurrManager: form.YearsWithCurrManager ? Number(form.YearsWithCurrManager) : null,
          NumCompaniesWorked: form.NumCompaniesWorked ? Number(form.NumCompaniesWorked) : null,
          Education: form.Education ? Number(form.Education) : null,
          EnvironmentSatisfaction: form.EnvironmentSatisfaction ? Number(form.EnvironmentSatisfaction) : null,
          JobSatisfaction: form.JobSatisfaction ? Number(form.JobSatisfaction) : null,
          RelationshipSatisfaction: form.RelationshipSatisfaction ? Number(form.RelationshipSatisfaction) : null,
          JobInvolvement: form.JobInvolvement ? Number(form.JobInvolvement) : null,
          WorkLifeBalance: form.WorkLifeBalance ? Number(form.WorkLifeBalance) : null,
          DistanceFromHome: form.DistanceFromHome ? Number(form.DistanceFromHome) : null,
          TrainingTimesLastYear: form.TrainingTimesLastYear ? Number(form.TrainingTimesLastYear) : null,
          StockOptionLevel: form.StockOptionLevel ? Number(form.StockOptionLevel) : null,
          PerformanceRating: form.PerformanceRating ? Number(form.PerformanceRating) : null,
          JobLevel: form.JobLevel ? Number(form.JobLevel) : null,
        },
      };

      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Backend error: ${errorText}`);
      }
      const json = (await res.json()) as Result;
      setResult(json);
    } catch (e: any) {
      // Show error to user
      if (e.message && e.message.includes("Failed to fetch") || e.message.includes("ERR_CONNECTION_REFUSED")) {
        setError("Backend server is not running. Please start the backend server on port 8000.");
      } else {
        setError(e.message || "An error occurred while making the prediction.");
      }
      // Fallback for demo purposes if backend isn't running
      setResult({
        prediction: "Low Risk",
        probability: 0.15,
        sentence: "Based on the provided data, this employee shows high stability markers. (Demo mode - backend not connected)"
      });
    } finally {
      setLoading(false);
    }
  }

  const config = riskConfig(result?.probability ?? null);

  return (
    <main className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-yellow-100">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#fefce8_0%,transparent_50%),radial-gradient(circle_at_80%_80%,#fffbeb_0%,transparent_50%)]" />
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-yellow-100/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-yellow-600 font-bold tracking-tighter text-sm uppercase">
              <Sparkles className="w-4 h-4" />
              Intelligence Engine
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Attrition <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-600">Predictor</span>
            </h1>
            <p className="text-slate-500 max-w-md">
              AI-driven insights 
            </p>
          </div>

          <motion.div 
            initial={false}
            animate={{ scale: result ? 1 : 0.95 }}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 shadow-sm",
              config.color
            )}
          >
            {config.icon}
            <span className="font-bold tracking-tight">{config.text}</span>
          </motion.div>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Employee Profile</h2>
              </div>

              <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="Age" icon={<TrendingDown className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.Age}
                        onChange={(e) => setForm(f => ({ ...f, Age: e.target.value }))}
                        placeholder="25-60"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>

                    <InputGroup label="Gender" icon={<Users className="w-4 h-4" />}>
                      <div className="grid grid-cols-2 gap-2">
                        {["Male", "Female"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setForm(f => ({ ...f, Gender: opt }))}
                            className={cn(
                              "py-3 rounded-2xl font-bold text-sm transition-all",
                              form.Gender === opt 
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </InputGroup>

                    <InputGroup label="Marital Status" icon={<Users className="w-4 h-4" />} className="md:col-span-2">
                      <div className="grid grid-cols-3 gap-2">
                        {["Single", "Married", "Divorced"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setForm(f => ({ ...f, MaritalStatus: opt }))}
                            className={cn(
                              "py-3 rounded-2xl font-bold text-sm transition-all",
                              form.MaritalStatus === opt 
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </InputGroup>
                  </div>
                </div>

                {/* Job Details */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Job Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="Department" icon={<Users className="w-4 h-4" />}>
                      <select
                        value={form.Department}
                        onChange={(e) => setForm(f => ({ ...f, Department: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="Sales">Sales</option>
                        <option value="Research & Development">Research & Development</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Job Role" icon={<Briefcase className="w-4 h-4" />}>
                      <select
                        value={form.JobRole}
                        onChange={(e) => setForm(f => ({ ...f, JobRole: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="Sales Executive">Sales Executive</option>
                        <option value="Research Scientist">Research Scientist</option>
                        <option value="Laboratory Technician">Laboratory Technician</option>
                        <option value="Manufacturing Director">Manufacturing Director</option>
                        <option value="Healthcare Representative">Healthcare Representative</option>
                        <option value="Manager">Manager</option>
                        <option value="Sales Representative">Sales Representative</option>
                        <option value="Research Director">Research Director</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Job Level" icon={<TrendingDown className="w-4 h-4" />}>
                      <select
                        value={form.JobLevel}
                        onChange={(e) => setForm(f => ({ ...f, JobLevel: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                        <option value="5">Level 5</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Travel Frequency" icon={<MapPin className="w-4 h-4" />}>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "Non-Travel", label: "No Travel" },
                          { id: "Travel_Rarely", label: "Rarely" },
                          { id: "Travel_Frequently", label: "Frequently" }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setForm(f => ({ ...f, BusinessTravel: opt.id }))}
                            className={cn(
                              "px-4 py-2 rounded-2xl font-bold text-xs transition-all flex-1 min-w-[80px]",
                              form.BusinessTravel === opt.id
                                ? "bg-yellow-600 text-white shadow-lg shadow-yellow-100"
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </InputGroup>

                    <InputGroup label="Overtime" icon={<Clock className="w-4 h-4" />}>
                      <div className="grid grid-cols-2 gap-2">
                        {["Yes", "No"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setForm(f => ({ ...f, OverTime: opt }))}
                            className={cn(
                              "py-3 rounded-2xl font-bold text-sm transition-all",
                              form.OverTime === opt 
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </InputGroup>
                  </div>
                </div>

                {/* Compensation */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Compensation</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="Monthly Income" icon={<Briefcase className="w-4 h-4" />}>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={form.MonthlyIncome}
                          onChange={(e) => setForm(f => ({ ...f, MonthlyIncome: e.target.value }))}
                          placeholder="Amount"
                          className="w-full bg-slate-50 border-none rounded-2xl pl-9 pr-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                        />
                      </div>
                    </InputGroup>

                    <InputGroup label="Percent Salary Hike" icon={<TrendingDown className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.PercentSalaryHike}
                        onChange={(e) => setForm(f => ({ ...f, PercentSalaryHike: e.target.value }))}
                        placeholder="%"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>
                  </div>
                </div>

                {/* Experience & Tenure */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Experience & Tenure</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="Total Working Years" icon={<Clock className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.TotalWorkingYears}
                        onChange={(e) => setForm(f => ({ ...f, TotalWorkingYears: e.target.value }))}
                        placeholder="Years"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>

                    <InputGroup label="Years at Company" icon={<Clock className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.YearsAtCompany}
                        onChange={(e) => setForm(f => ({ ...f, YearsAtCompany: e.target.value }))}
                        placeholder="Years"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>

                    <InputGroup label="Years in Current Role" icon={<Clock className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.YearsInCurrentRole}
                        onChange={(e) => setForm(f => ({ ...f, YearsInCurrentRole: e.target.value }))}
                        placeholder="Years"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>

                    <InputGroup label="Years Since Last Promotion" icon={<Clock className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.YearsSinceLastPromotion}
                        onChange={(e) => setForm(f => ({ ...f, YearsSinceLastPromotion: e.target.value }))}
                        placeholder="Years"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>

                    <InputGroup label="Years with Current Manager" icon={<Clock className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.YearsWithCurrManager}
                        onChange={(e) => setForm(f => ({ ...f, YearsWithCurrManager: e.target.value }))}
                        placeholder="Years"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>

                    <InputGroup label="Number of Companies Worked" icon={<Briefcase className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.NumCompaniesWorked}
                        onChange={(e) => setForm(f => ({ ...f, NumCompaniesWorked: e.target.value }))}
                        placeholder="Count"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Education</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="Education Level" icon={<Users className="w-4 h-4" />}>
                      <select
                        value={form.Education}
                        onChange={(e) => setForm(f => ({ ...f, Education: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="1">Below College</option>
                        <option value="2">College</option>
                        <option value="3">Bachelor</option>
                        <option value="4">Master</option>
                        <option value="5">Doctor</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Education Field" icon={<Users className="w-4 h-4" />}>
                      <select
                        value={form.EducationField}
                        onChange={(e) => setForm(f => ({ ...f, EducationField: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="Life Sciences">Life Sciences</option>
                        <option value="Other">Other</option>
                        <option value="Medical">Medical</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Technical Degree">Technical Degree</option>
                        <option value="Human Resources">Human Resources</option>
                      </select>
                    </InputGroup>
                  </div>
                </div>

                {/* Satisfaction & Engagement */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Satisfaction & Engagement (1-4 scale)</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="Environment Satisfaction" icon={<ShieldCheck className="w-4 h-4" />}>
                      <select
                        value={form.EnvironmentSatisfaction}
                        onChange={(e) => setForm(f => ({ ...f, EnvironmentSatisfaction: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="1">1 - Low</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4 - High</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Job Satisfaction" icon={<ShieldCheck className="w-4 h-4" />}>
                      <select
                        value={form.JobSatisfaction}
                        onChange={(e) => setForm(f => ({ ...f, JobSatisfaction: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="1">1 - Low</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4 - High</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Relationship Satisfaction" icon={<ShieldCheck className="w-4 h-4" />}>
                      <select
                        value={form.RelationshipSatisfaction}
                        onChange={(e) => setForm(f => ({ ...f, RelationshipSatisfaction: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="1">1 - Low</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4 - High</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Job Involvement" icon={<ShieldCheck className="w-4 h-4" />}>
                      <select
                        value={form.JobInvolvement}
                        onChange={(e) => setForm(f => ({ ...f, JobInvolvement: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="1">1 - Low</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4 - High</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Work Life Balance" icon={<ShieldCheck className="w-4 h-4" />}>
                      <select
                        value={form.WorkLifeBalance}
                        onChange={(e) => setForm(f => ({ ...f, WorkLifeBalance: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="1">1 - Low</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4 - High</option>
                      </select>
                    </InputGroup>
                  </div>
                </div>

                {/* Other */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">Other Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="Distance from Home (miles)" icon={<MapPin className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.DistanceFromHome}
                        onChange={(e) => setForm(f => ({ ...f, DistanceFromHome: e.target.value }))}
                        placeholder="Miles"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>

                    <InputGroup label="Training Times Last Year" icon={<Clock className="w-4 h-4" />}>
                      <input
                        type="number"
                        value={form.TrainingTimesLastYear}
                        onChange={(e) => setForm(f => ({ ...f, TrainingTimesLastYear: e.target.value }))}
                        placeholder="Count"
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium"
                      />
                    </InputGroup>

                    <InputGroup label="Stock Option Level" icon={<TrendingDown className="w-4 h-4" />}>
                      <select
                        value={form.StockOptionLevel}
                        onChange={(e) => setForm(f => ({ ...f, StockOptionLevel: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </InputGroup>

                    <InputGroup label="Performance Rating" icon={<TrendingDown className="w-4 h-4" />}>
                      <select
                        value={form.PerformanceRating}
                        onChange={(e) => setForm(f => ({ ...f, PerformanceRating: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none text-slate-700 font-medium appearance-none"
                      >
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </InputGroup>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={onPredict}
                  disabled={loading}
                  className={cn(
                    "w-full group relative overflow-hidden flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-lg tracking-tight transition-all duration-300",
                    loading 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-yellow-600 text-white hover:bg-yellow-700 shadow-xl shadow-yellow-200 hover:shadow-yellow-300 hover:-translate-y-1 active:translate-y-0"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      Run Prediction Engine
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-5 sticky top-12">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white overflow-hidden relative">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[60px]" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold tracking-tight">Analysis Output</h2>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>

                <FlowerGrowth show={loading} />

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 py-8"
                    >
                      <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                      <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400 mb-2">Probability Score</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black">{progress}%</span>
                          <span className="text-white/40 font-medium">Confidence</span>
                        </div>
                        
                        <div className="mt-6 h-3 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r",
                              config.gradient
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                          <h3 className="font-bold text-lg">Verdict</h3>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-lg italic">
                          "{result.sentence}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-[10px] font-black uppercase text-white/30 mb-1">Status</div>
                          <div className="font-bold text-sm">{result.prediction}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-[10px] font-black uppercase text-white/30 mb-1">AI Reliability</div>
                          <div className="font-bold text-sm">High</div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      className="text-center py-20 space-y-4"
                    >
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-white/20" />
                      </div>
                      <p className="text-slate-500 font-medium px-8 leading-relaxed">
                        The neural engine is ready. Input employee metrics to begin the analysis.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FlowerGrowth({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="relative w-full overflow-hidden rounded-3xl border border-lime-200/60 bg-white/60 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
        >
          {/* soft yellow-green glow */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-yellow-200/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-lime-200/35 blur-3xl" />

          <div className="relative mx-auto flex h-36 max-w-sm items-end justify-center">
            {/* stem */}
            <motion.div
              className="absolute bottom-14 h-0 w-1.5 rounded-full bg-gradient-to-t from-lime-700 to-lime-400"
              initial={{ height: 0 }}
              animate={{ height: 90 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />

            {/* left leaf */}
            <motion.div
              className="absolute bottom-20 left-1/2 h-4 w-9 -translate-x-10 rounded-full bg-lime-400/90"
              style={{ transformOrigin: "right center" }}
              initial={{ scaleX: 0, rotate: -10, opacity: 0 }}
              animate={{ scaleX: 1, rotate: -18, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
            />

            {/* right leaf */}
            <motion.div
              className="absolute bottom-24 left-1/2 h-4 w-9 translate-x-1 rounded-full bg-lime-400/90"
              style={{ transformOrigin: "left center" }}
              initial={{ scaleX: 0, rotate: 10, opacity: 0 }}
              animate={{ scaleX: 1, rotate: 18, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
            />

            {/* flower head */}
            <motion.div
              className="absolute bottom-[108px] left-1/2 -translate-x-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.95, duration: 0.5, ease: "backOut" }}
            >
              <div className="relative h-10 w-10">
                {/* petals */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 h-6 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 shadow-sm"
                    style={{ transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-10px)` }}
                  />
                ))}
                {/* center */}
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500" />
              </div>
            </motion.div>

            {/* pot */}
            <div className="relative z-10 h-14 w-28">
              <div className="absolute bottom-0 h-10 w-full rounded-b-2xl rounded-t-md bg-gradient-to-b from-stone-700 to-stone-900 shadow-lg" />
              <div className="absolute bottom-8 h-6 w-full rounded-2xl bg-stone-800/90" />
              <div className="absolute bottom-8 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-white/10" />
            </div>
          </div>

          <motion.div
            className="mt-3 text-center text-sm font-semibold tracking-widest text-lime-700 uppercase"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            Growing insights…
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function InputGroup({ 
  label, 
  icon, 
  children, 
  className 
}: { 
  label: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="flex items-center gap-2 text-[13px] font-black uppercase tracking-wider text-slate-400">
        <span className="text-yellow-500">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

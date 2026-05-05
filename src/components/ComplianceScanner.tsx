import { useState } from 'react';

interface Option {
  label: string;
  score: number;
  advice: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

interface Props {
  title: string;
  subtitle: string;
  stepLabel: string;
  resultTitle: string;
  resultSubtitle: string;
  ctaText: string;
  resetText: string;
  questions: Question[];
}

export default function ComplianceScanner({ 
  title, 
  subtitle, 
  stepLabel, 
  resultTitle, 
  resultSubtitle, 
  ctaText, 
  resetText,
  questions 
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (option: any) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setIsFinished(false);
  };

  const totalScore = answers.reduce((acc, curr) => acc + curr.score, 0);
  const maxScore = questions.reduce((acc, q) => acc + Math.max(...q.options.map(o => o.score)), 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  if (isFinished) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <span className="text-3xl font-bold">{percentage}%</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{resultTitle}</h2>
          <p className="text-slate-600 mt-2">{resultSubtitle}</p>
        </div>

        <div className="space-y-4 mb-8">
          {answers.filter(a => a.advice).map((answer, i) => (
            <div key={i} className="flex items-start p-4 bg-slate-50 rounded-lg">
              <svg className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-700">{answer.advice}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/docs/quickstart" className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            {ctaText}
          </a>
          <button onClick={reset} className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
            {resetText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">{stepLabel} {currentStep + 1} of {questions.length}</span>
          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{questions[currentStep].text}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {questions[currentStep].options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(option)}
            className="group relative flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
          >
            <div className="h-6 w-6 border-2 border-slate-200 rounded-full mr-4 group-hover:border-indigo-500 flex items-center justify-center">
              <div className="h-2 w-2 bg-indigo-500 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
            </div>
            <span className="text-lg font-medium text-slate-700 group-hover:text-indigo-900">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
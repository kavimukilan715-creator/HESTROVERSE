import { useState } from 'react';
import { CheckCircle2, RotateCcw, X, XCircle } from 'lucide-react';
import { HISTORICAL_QUIZ } from '../data/historicalArchive';

interface KnowledgeCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KnowledgeCheckModal({ isOpen, onClose }: KnowledgeCheckModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const question = HISTORICAL_QUIZ[currentIdx];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.correctIndex;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    if (idx === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < HISTORICAL_QUIZ.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#111317] border border-[#2A2E37] text-[#ECEAE4]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252830] bg-[#16181D]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#D4B483]">
              Archival Self-Assessment
            </p>
            <h2 id="quiz-modal-title" className="font-serif text-xl font-semibold text-[#ECEAE4]">
              Sovereign Law &amp; Reform Knowledge Check
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close knowledge check"
            className="w-8 h-8 inline-flex items-center justify-center border border-[#2A2E37] bg-[#181B20] text-[#ECEAE4] hover:bg-[#22262E]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {!completed ? (
            <>
              <div className="flex items-center justify-between text-xs font-mono text-[#9CA3AF] tabular-nums mb-4">
                <span>{question.eraLabel}</span>
                <span>
                  Question {currentIdx + 1} of {HISTORICAL_QUIZ.length}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-semibold text-[#ECEAE4] leading-snug">
                {question.question}
              </h3>

              <div className="mt-6 space-y-2.5">
                {question.options.map((opt, idx) => {
                  const chosen = selectedOption === idx;
                  const rightAnswer = idx === question.correctIndex;
                  let rowStyle =
                    'border-[#2A2E37] bg-[#16181D] hover:border-[#6B7280] text-[#ECEAE4]';

                  if (isAnswered) {
                    if (rightAnswer) {
                      rowStyle = 'border-[#059669] bg-[#064E3B]/35 text-[#D1FAE5]';
                    } else if (chosen && !rightAnswer) {
                      rowStyle = 'border-[#DC2626] bg-[#7F1D1D]/35 text-[#FEE2E2]';
                    } else {
                      rowStyle = 'border-[#22252C] bg-[#0E1014] text-[#9CA3AF]';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 border text-sm leading-relaxed transition-colors flex items-start justify-between gap-3 ${rowStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && rightAnswer && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono shrink-0 text-[#34D399]">
                          <CheckCircle2 className="w-4 h-4" />
                          Correct
                        </span>
                      )}
                      {isAnswered && chosen && !rightAnswer && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono shrink-0 text-[#F87171]">
                          <XCircle className="w-4 h-4" />
                          Incorrect
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-6 p-4 bg-[#171A20] border border-[#2A2E37]">
                  <p className="font-mono text-xs uppercase tracking-wider text-[#D4B483] mb-1">
                    {isCorrect ? 'Verified Historical Context' : 'Historical Clarification'}
                  </p>
                  <p className="text-sm text-[#D1D5DB] leading-relaxed">
                    {question.explanation}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C] transition-colors"
                    >
                      {currentIdx + 1 < HISTORICAL_QUIZ.length ? 'Next Question' : 'View Summary'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="font-mono text-xs uppercase tracking-widest text-[#D4B483]">
                Assessment Complete
              </p>
              <h3 className="mt-2 font-serif text-4xl font-semibold text-[#ECEAE4] tabular-nums">
                {score} / {HISTORICAL_QUIZ.length} Correct
              </h3>
              <p className="mt-3 text-sm text-[#A3A7B0] max-w-md mx-auto leading-relaxed">
                Explore the Law &amp; Consequence table and individual ruler monographs to inspect primary statutes and procedural turning points in greater detail.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#ECEAE4] border border-[#2A2E37] bg-[#181B20] hover:border-[#6B7280]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Check
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#991B1B] hover:bg-[#B91C1C]"
                >
                  Return to Archive
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

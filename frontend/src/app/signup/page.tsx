"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ONBOARDING_QUESTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import type { OnboardingAnswers } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  // Form state
  const [step, setStep] = useState<"credentials" | "quiz" | "complete">(
    "credentials"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  // Loading/Error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const question = ONBOARDING_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setStep("quiz");
  };

  const handleAnswerSelect = (value: string | string[] | number) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleMultiSelect = (value: string) => {
    const currentValue = (answers[question.id] as string[]) || [];
    const newValue = currentValue.includes(value)
      ? currentValue.filter((v) => v !== value)
      : [...currentValue, value];
    handleAnswerSelect(newValue);
  };

  const handleNext = async () => {
    if (currentQuestion < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Submit registration
      setIsLoading(true);
      setError("");

      try {
        const response = await authApi.register({
          email,
          password,
          name,
          onboardingAnswers: answers,
        });

        if (response.success && response.data) {
          setUser(response.data.user, response.data.token);
          setStep("complete");
          setTimeout(() => {
            router.push("/explore");
          }, 2000);
        } else {
          setError(response.error || "Registration failed");
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setStep("credentials");
    }
  };

  const canProceed = () => {
    if (!answers[question.id]) return false;
    if (question.type === "multiple") {
      return (answers[question.id] as string[]).length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-accent-purple/10 via-transparent to-transparent" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-accent-blue/10 via-transparent to-transparent" />
      </div>

      <Container size="sm">
        <AnimatePresence mode="wait">
          {/* Credentials Step */}
          {step === "credentials" && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  Personalized Experience
                </div>
                <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
                <p className="text-fg-muted">
                  Join to get personalized thrift store recommendations
                </p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <Input
                  label="Name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-fg transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />

                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}

                <Button type="submit" variant="primary" className="w-full h-12">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-fg-muted mt-6">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-accent-blue hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {/* Quiz Step */}
          {step === "quiz" && (
            <motion.div
              key={`quiz-${currentQuestion}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-fg-muted mb-2">
                  <span>
                    Question {currentQuestion + 1} of{" "}
                    {ONBOARDING_QUESTIONS.length}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-canvas-subtle rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent-blue to-accent-purple"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {question.question}
                </h2>
                {question.type === "multiple" && (
                  <p className="text-fg-muted">Select all that apply</p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.type === "single" &&
                  question.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswerSelect(option.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all duration-200",
                        answers[question.id] === option.value
                          ? "border-accent-blue bg-accent-blue/10"
                          : "border-border hover:border-fg-muted bg-canvas-subtle"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{option.label}</span>
                          {option.description && (
                            <p className="text-sm text-fg-muted mt-0.5">
                              {option.description}
                            </p>
                          )}
                        </div>
                        {answers[question.id] === option.value && (
                          <Check className="h-5 w-5 text-accent-blue shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}

                {question.type === "multiple" && (
                  <div className="grid grid-cols-2 gap-3">
                    {question.options?.map((option) => {
                      const isSelected = (
                        (answers[question.id] as string[]) || []
                      ).includes(option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleMultiSelect(option.value)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all duration-200",
                            isSelected
                              ? "border-accent-blue bg-accent-blue/10"
                              : "border-border hover:border-fg-muted bg-canvas-subtle"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {option.icon && (
                              <span className="text-2xl">{option.icon}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">{option.label}</span>
                              {option.description && (
                                <p className="text-xs text-fg-muted mt-0.5 line-clamp-2">
                                  {option.description}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-accent-blue shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {question.type === "slider" && (
                  <div className="px-4 py-8">
                    <input
                      type="range"
                      min={question.min}
                      max={question.max}
                      step={question.step}
                      value={(answers[question.id] as number) || question.min}
                      onChange={(e) =>
                        handleAnswerSelect(parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-canvas-subtle rounded-full appearance-none cursor-pointer accent-accent-blue"
                    />
                    <div className="flex justify-between text-sm text-fg-muted mt-2">
                      <span>{question.labels?.min}</span>
                      <span className="text-lg font-bold text-accent-blue">
                        {(answers[question.id] as number) || question.min}
                      </span>
                      <span>{question.labels?.max}</span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center mt-4">{error}</p>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  {currentQuestion === ONBOARDING_QUESTIONS.length - 1
                    ? "Complete"
                    : "Next"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Complete Step */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-green/10 flex items-center justify-center">
                <Check className="h-10 w-10 text-accent-green" />
              </div>
              <h2 className="text-3xl font-bold mb-2">You're All Set! 🎉</h2>
              <p className="text-fg-muted mb-6">
                We've customized your experience. Taking you to your personalized
                feed...
              </p>
              <div className="flex justify-center">
                <div className="animate-pulse flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-accent-blue" />
                  <div className="w-2 h-2 rounded-full bg-accent-purple" />
                  <div className="w-2 h-2 rounded-full bg-accent-pink" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}


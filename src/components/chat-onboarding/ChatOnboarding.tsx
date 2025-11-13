import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useConvexMutation } from '@convex-dev/react-query';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { TypingIndicator } from './TypingIndicator';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import { QuestionInput, type QuestionConfig } from './QuestionInput';
import { VerticalTimeline, type TimelineStep } from './VerticalTimeline';

const TECH_STACK_OPTIONS = [
  { value: 'JavaScript/TypeScript', label: 'JavaScript/TypeScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
  { value: 'C#/.NET', label: 'C#/.NET' },
  { value: 'Ruby', label: 'Ruby' },
  { value: 'PHP', label: 'PHP' },
  { value: 'Swift', label: 'Swift' },
  { value: 'Kotlin', label: 'Kotlin' },
];

const DEVELOPMENT_GOAL_OPTIONS = [
  { value: 'Break into tech', label: 'Break into tech' },
  { value: 'Land first developer role', label: 'Land first developer role' },
  { value: 'Level up to mid-level', label: 'Level up to mid-level' },
  { value: 'Advance to senior developer', label: 'Advance to senior developer' },
  { value: 'Transition to leadership/management', label: 'Transition to leadership/management' },
  { value: 'Master a specific technology/framework', label: 'Master a specific technology/framework' },
  { value: 'Build side projects/portfolio', label: 'Build side projects/portfolio' },
];

const DAYS_OF_WEEK = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
];

const JOURNALING_TIME_PRESETS = [
  { value: 'End of workday', label: 'End of workday (5-6 PM)' },
  { value: 'Evening reflection', label: 'Evening reflection (8-9 PM)' },
  { value: 'Morning review', label: 'Morning review (8-9 AM)' },
  { value: 'No preference', label: "No preference (I'll journal when inspired)" },
];

const NOTIFICATION_OPTIONS = [
  { value: 'Push notifications', label: 'Push notifications' },
  { value: 'Email reminders', label: 'Email reminders' },
  { value: 'None', label: 'None' },
];

// Timeline step definitions
const TIMELINE_STEPS = [
  { id: 'profile', label: 'Profile Info' },
  { id: 'mentorship', label: 'Goals & Style' },
  { id: 'tech', label: 'Tech Stack' },
  { id: 'schedule', label: 'Journal Schedule' },
];

type MessageType = 'assistant' | 'user' | 'typing';

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  questionId?: string;
}

interface ChatOnboardingProps {
  userId: Id<'users'>;
}

export default function ChatOnboarding({ userId }: ChatOnboardingProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [showTyping, setShowTyping] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const { mutateAsync: completeOnboarding } = useMutation({
    mutationFn: useConvexMutation(api.onboarding.completeOnboarding),
  });

  // Define all questions in a conversational flow
  const questions: QuestionConfig[] = [
    {
      id: 'fullName',
      type: 'text',
      label: "What's your full name?",
      placeholder: 'e.g., Jane Doe',
      required: true,
    },
    {
      id: 'age',
      type: 'number',
      label: 'How old are you? (Optional - but helps me personalize guidance)',
      placeholder: '25',
      required: false,
    },
    {
      id: 'currentRole',
      type: 'text',
      label: "What's your current role?",
      placeholder: 'e.g., Frontend Developer, Full Stack Engineer',
      required: true,
    },
    {
      id: 'experienceLevel',
      type: 'select',
      label: "What's your experience level?",
      options: [
        { value: 'Junior', label: 'Junior' },
        { value: 'Mid-Level', label: 'Mid-Level' },
        { value: 'Senior', label: 'Senior' },
        { value: 'Lead', label: 'Lead' },
        { value: 'Principal', label: 'Principal' },
      ],
      required: true,
    },
    {
      id: 'mentorshipStyle',
      type: 'radio',
      label: 'What mentorship style resonates with you?',
      options: [
        { value: 'Structured', label: 'Structured - Clear guidance and step-by-step plans' },
        { value: 'Exploratory', label: 'Exploratory - Learn through experimentation' },
        { value: 'Challenge-driven', label: 'Challenge-driven - Grow outside comfort zone' },
        { value: 'Reflective', label: 'Reflective - Deep analysis and thoughtful feedback' },
      ],
      required: true,
    },
    {
      id: 'developmentGoals',
      type: 'checkbox-group',
      label: 'What are your development goals? (Select all that apply)',
      options: DEVELOPMENT_GOAL_OPTIONS,
      required: true,
    },
    {
      id: 'customGoal',
      type: 'text',
      label: "Any other goals you'd like to add? (Optional)",
      placeholder: 'e.g., Learn Docker, Contribute to open source',
      required: false,
    },
    {
      id: 'techStack',
      type: 'checkbox-group',
      label: 'What technologies do you work with? (Select all that apply)',
      options: TECH_STACK_OPTIONS,
      required: true,
    },
    {
      id: 'customTechStack',
      type: 'text',
      label: 'Any other technologies not listed? (Optional)',
      placeholder: 'e.g., Elixir, Haskell',
      required: false,
    },
    {
      id: 'workEnvironment',
      type: 'select',
      label: "What's your current work environment?",
      options: [
        { value: 'Individual contributor at company', label: 'Individual contributor at company' },
        { value: 'Team lead/manager', label: 'Team lead/manager' },
        { value: 'Freelance/consultant', label: 'Freelance/consultant' },
        { value: 'Student/bootcamp', label: 'Student/bootcamp' },
        { value: 'Career transition/job seeking', label: 'Career transition/job seeking' },
        { value: 'Side projects only', label: 'Side projects only' },
      ],
      required: true,
    },
    {
      id: 'journalingFrequency',
      type: 'radio',
      label: 'How often would you like to journal?',
      options: [
        { value: 'Daily', label: 'Daily' },
        { value: 'Every other day', label: 'Every other day' },
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Custom schedule', label: 'Custom schedule' },
      ],
      required: true,
    },
    {
      id: 'customScheduleDays',
      type: 'checkbox-group',
      label: 'Which days would you like to journal? (Select all that apply)',
      options: DAYS_OF_WEEK,
      required: true,
      conditionalOn: {
        fieldId: 'journalingFrequency',
        value: 'Custom schedule',
      },
    },
    {
      id: 'journalingTime',
      type: 'select',
      label: 'When do you prefer to journal?',
      options: JOURNALING_TIME_PRESETS,
      required: true,
    },
    {
      id: 'customTime',
      type: 'time',
      label: 'Or pick a specific time:',
      required: false,
    },
    {
      id: 'notificationPreferences',
      type: 'checkbox-group',
      label: 'How would you like to be reminded?',
      options: NOTIFICATION_OPTIONS,
      required: true,
    },
  ];

  // Calculate timeline progress
  const getTimelineSteps = (): TimelineStep[] => {
    const currentStep = getCurrentTimelineStep();
    return TIMELINE_STEPS.map((step, index) => ({
      id: step.id,
      label: step.label,
      completed: index < currentStep,
      current: index === currentStep,
    }));
  };

  const getCurrentTimelineStep = (): number => {
    if (currentQuestionIndex < 0) return 0;
    if (currentQuestionIndex <= 3) return 0; // Profile (questions 0-3)
    if (currentQuestionIndex <= 6) return 1; // Mentorship & Goals (questions 4-6)
    if (currentQuestionIndex <= 9) return 2; // Tech Stack (questions 7-9)
    return 3; // Journal Schedule (questions 10+)
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      };
      // Small delay to ensure content is rendered
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, showTyping]);

  // Initialize with welcome message - only once
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content:
        "Welcome to June Bug! 👋 I'm excited to help you on your developer journey. Let me ask you a few questions to personalize your experience. Don't worry - you can always change these settings later in your preferences.",
    };
    setMessages([welcomeMessage]);

    // Show first question after welcome
    setTimeout(() => {
      showNextQuestion();
    }, 1000);
  }, []);

  const showNextQuestion = () => {
    // Skip questions that don't meet conditional requirements
    let nextIndex = currentQuestionIndex + 1;
    let nextQuestion = questions[nextIndex];

    while (nextQuestion && nextQuestion.conditionalOn) {
      const dependentValue = formData[nextQuestion.conditionalOn.fieldId];
      const shouldShow = Array.isArray(nextQuestion.conditionalOn.value)
        ? nextQuestion.conditionalOn.value.includes(dependentValue)
        : dependentValue === nextQuestion.conditionalOn.value;

      if (shouldShow) {
        break;
      }
      nextIndex++;
      nextQuestion = questions[nextIndex];
    }

    if (!nextQuestion) {
      // All questions answered, show summary and complete
      handleCompletion();
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setShowTyping(true);

    setTimeout(() => {
      setShowTyping(false);
      const questionMessage: ChatMessage = {
        id: `question-${nextIndex}`,
        type: 'assistant',
        content: nextQuestion.label,
        questionId: nextQuestion.id,
      };
      setMessages((prev) => [...prev, questionMessage]);
    }, 800); // Quick typing indicator (800ms as requested)
  };

  const handleAnswer = (questionId: string, value: any) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    // Update form data
    const updatedFormData = { ...formData, [questionId]: value };
    setFormData(updatedFormData);

    // Format the answer for display
    let displayValue = '';
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (question.type === 'select' || question.type === 'radio') {
      const option = question.options?.find((opt) => opt.value === value);
      displayValue = option?.label || value;
    } else {
      displayValue = value?.toString() || '';
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `answer-${questionId}`,
      type: 'user',
      content: displayValue || '(Skipped)',
    };
    setMessages((prev) => [...prev, userMessage]);

    // Move to next question
    setTimeout(() => {
      showNextQuestion();
    }, 500);
  };

  const validateCurrentAnswer = (value: any): boolean => {
    const question = questions[currentQuestionIndex];
    if (!question) return false;
    if (!question.required) return true;

    if (question.type === 'checkbox-group') {
      return Array.isArray(value) && value.length > 0;
    }

    return value !== '' && value !== null && value !== undefined;
  };

  const handleCompletion = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      setShowTyping(true);

      setTimeout(async () => {
        setShowTyping(false);
        const summaryMessage: ChatMessage = {
          id: 'summary',
          type: 'assistant',
          content: `Perfect! I've got everything I need. Let me set up your personalized journaling experience...`,
        };
        setMessages((prev) => [...prev, summaryMessage]);

        // Prepare data for submission
        const allGoals = [
          ...(formData.developmentGoals || []),
          ...(formData.customGoal?.trim() ? [formData.customGoal] : []),
        ];
        const allTechStack = [
          ...(formData.techStack || []),
          ...(formData.customTechStack?.trim() ? [formData.customTechStack] : []),
        ];
        const finalJournalingTime = formData.customTime || formData.journalingTime;

        await completeOnboarding({
          userId,
          fullName: formData.fullName,
          age: formData.age,
          currentRole: formData.currentRole,
          experienceLevel: formData.experienceLevel,
          mentorshipStyle: formData.mentorshipStyle,
          developmentGoals: allGoals,
          techStack: allTechStack,
          workEnvironment: formData.workEnvironment,
          journalingFrequency: formData.journalingFrequency,
          customScheduleDays:
            formData.journalingFrequency === 'Custom schedule'
              ? formData.customScheduleDays
              : undefined,
          journalingTime: finalJournalingTime,
          notificationPreferences: formData.notificationPreferences,
        });

        toast.success('Welcome to June Bug! 🎉');
        window.location.href = '/entries';
      }, 800);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Something went wrong. Please try again.');
      setIsCompleting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentValue = currentQuestion ? formData[currentQuestion.id] : null;
  const isCurrentAnswerValid = currentQuestion
    ? validateCurrentAnswer(currentValue)
    : false;

  // Determine which assistant messages should show the avatar (only the most recent one)
  const assistantMessages = messages.filter((m) => m.type === 'assistant');
  const lastAssistantMessageId =
    assistantMessages.length > 0
      ? assistantMessages[assistantMessages.length - 1].id
      : null;

  return (
    <div className="flex h-screen bg-linear-to-br from-background via-background to-muted/20">
      {/* Vertical Timeline Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 px-6 py-8">
        <h2 className="text-lg font-semibold mb-6">Your Journey</h2>
        <VerticalTimeline steps={getTimelineSteps()} />
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 flex flex-col">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto py-6 space-y-2"
        >
          {messages.map((message) => {
            if (message.type === 'assistant') {
              const showAvatar = message.id === lastAssistantMessageId;
              return (
                <AssistantMessage key={message.id} showAvatar={showAvatar}>
                  {message.content}
                </AssistantMessage>
              );
            } else if (message.type === 'user') {
              return <UserMessage key={message.id}>{message.content}</UserMessage>;
            }
            return null;
          })}

          {showTyping && <TypingIndicator />}

          {/* Current Question Input */}
          {!showTyping && currentQuestion && (
            <QuestionInput
              question={currentQuestion}
              value={currentValue}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, [currentQuestion.id]: value }))
              }
              onSubmit={() => handleAnswer(currentQuestion.id, currentValue)}
              isValid={isCurrentAnswerValid}
              allValues={formData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

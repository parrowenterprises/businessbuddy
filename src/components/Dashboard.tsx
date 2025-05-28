import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import WorkingDashboard from './WorkingDashboard';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route: string;
}

export default function Dashboard() {
  const { customers, services, user, updateUser, isLoading } = useApp();
  const [showCelebration, setShowCelebration] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user has completed onboarding before, show working dashboard
  if (user?.hasCompletedOnboarding) {
    return <WorkingDashboard />;
  }

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Business Profile',
      description: 'Add your business details, service area, and operating hours.',
      completed: false, // TODO: Check from context/backend
      route: '/business-profile'
    },
    {
      id: 'services',
      title: 'Add Your Services',
      description: 'List the services you offer with prices and descriptions.',
      completed: services.length > 0,
      route: '/services'
    },
    {
      id: 'customer',
      title: 'Add Your First Customer',
      description: 'Start building your customer list.',
      completed: customers.length > 0,
      route: '/customers/new'
    },
    {
      id: 'quote',
      title: 'Create Your First Quote',
      description: 'Learn how to create professional quotes for your customers.',
      completed: false, // TODO: Check from context/backend
      route: '/quotes/new'
    }
  ];

  const hasCompletedOnboarding = onboardingSteps.every(step => step.completed);

  useEffect(() => {
    // When all steps are completed, update user state and show celebration
    if (hasCompletedOnboarding && !showCelebration && user) {
      updateUser({ hasCompletedOnboarding: true });
      setShowCelebration(true);
    }
  }, [hasCompletedOnboarding, showCelebration, user, updateUser]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BusinessBuddy!</h1>
        <p className="text-lg text-gray-600">
          Let's get your business set up. Complete these steps to start managing your side hustle like a pro.
        </p>
      </div>

      <div className="space-y-4">
        {onboardingSteps.map((step, index) => (
          <Link
            key={step.id}
            to={step.route}
            className={`block p-6 rounded-lg shadow transition duration-150 ease-in-out ${
              step.completed
                ? 'bg-green-50 hover:bg-green-100'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              <div
                className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-500' : 'bg-blue-600'
                }`}
              >
                {step.completed ? (
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                ) : (
                  <span className="text-white font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              <div className="ml-4">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    step.completed
                      ? 'text-green-700 bg-green-100'
                      : 'text-blue-700 bg-blue-100'
                  }`}
                >
                  {step.completed ? (
                    'Completed'
                  ) : (
                    <>
                      Start
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </>
                  )}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Setup Progress
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(
              (onboardingSteps.filter(step => step.completed).length /
                onboardingSteps.length) *
                100
            )}
            % Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{
              width: `${(onboardingSteps.filter(step => step.completed).length /
                onboardingSteps.length) *
                100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCelebration(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Congratulations!
            </h2>
            <p className="text-gray-600 mb-6">
              You've completed all the setup steps! Your business is ready to grow.
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Let's Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
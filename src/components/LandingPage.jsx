const LandingPage = ({ onOpenChat }) => {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Test Page
        </h1>
        <button
          type="button"
          onClick={onOpenChat}
          className="px-8 py-3 bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition-colors"
          style={{ borderRadius: '10%' }}
        >
          Create Test with AI
        </button>
      </div>
    </div>
  );
};
export default LandingPage;

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="relative mb-6">
        {/* Pig emoji spinner */}
        <div className="text-6xl animate-bounce">🐷</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-foreground/10 animate-pulse" />
      </div>
      <p className="text-lg font-semibold text-foreground">Memuat Model 3D...</p>
      <p className="text-sm text-muted-foreground mt-1">Mohon tunggu sebentar</p>
      <div className="mt-6 w-48 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;

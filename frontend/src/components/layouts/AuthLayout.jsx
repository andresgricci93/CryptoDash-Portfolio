import FloatingLines from '../common/FloatingLines';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gray-700">
      {/* Background - FloatingLines */}
      <div className="absolute inset-0 z-0">
        <FloatingLines 
          linesGradient={['#1F2937', '#1F2937', '#1F2937', '#1F2937']}
          enabledWaves={[ 'middle']}
          lineCount={[4, 6, 4]}
          animationSpeed={0.8}
          interactive={true}
          parallax={true}
          parallaxStrength={0.15}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;


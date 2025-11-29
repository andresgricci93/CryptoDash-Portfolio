const GenericInput = ({ 
  label = "",
  icon: Icon, 
  type = "text",
  validationState = "default",
  errorMessage = "",
  onBlur,
  disabled = false,
  ...props 
}) => {

    const getBorderColor = () => {
        if (validationState === "valid") return "border-green-500 focus:border-green-500 focus:ring-green-500";
        if (validationState === "error") return "border-red-500 focus:border-red-500 focus:ring-red-500";
        return "border-gray-600";
    };

    const getMessage = () => {
        if (validationState === "valid") {
            return { text: "Valid", color: "text-green-500" };
        }
        
        if (validationState === "error" && errorMessage) {
            return { text: errorMessage, color: "text-red-500" };
        }
        
        return null;
    };

    const message = getMessage();

    return (
        <div className="mb-4">
            {label && (
                <label className="text-white text-sm font-medium mb-2 block">
                    {label}
                </label>
            )}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Icon className="size-5 text-white"/>
                </div>
                <input 
                    {...props}
                    type={type}
                    onBlur={onBlur}
                    className={`w-full pl-10 pr-3 py-2 bg-gray-800 text-white rounded-lg border ${getBorderColor()} focus:ring-1 transition duration-200 ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={disabled}
                />
            </div>
            {message && (
                <p className={`text-xs mt-1 ${message.color}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default GenericInput;
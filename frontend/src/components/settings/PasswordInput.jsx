const PasswordInput = ({ 
  label = "",
  icon: Icon, 
  type = "password",
  validationState = "default",
  errorMessage = "",
  onBlur,
  disabled = false,
  ...props 
}) => {

    const getBorderColor = () => {
        if (validationState === "valid") return "border-green-500 focus:border-green-500 focus:ring-green-500";
        if (validationState === "error") return "border-red-500 focus:border-red-500 focus:ring-red-500";
        return "border-gray-700 focus:border-green-500 focus:ring-green-500";
    };

    const getMessage = () => {
    if (validationState === "valid") {
        if (label === "Current Password") {
        return { text: "Password correct", color: "text-green-500" };
        }
        if (label === "New Password") {
        return { text: "Password is strong enough", color: "text-green-500" };
        }
        if (label === "Confirm New Password") {
        return { text: "Passwords match", color: "text-green-500" };
        }
    }
    
    if (validationState === "error") {
        if (label === "Current Password") {
        return { text: "Incorrect password", color: "text-red-500" };
        }
        if (label === "New Password") {
        return { text: "Password is not strong enough", color: "text-red-500" };
        }
        if (label === "Confirm New Password") {
        return { text: "Passwords do not match", color: "text-red-500" };
        }
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
          <Icon className="size-5 text-green-500"/>
        </div>
        <input 
          {...props}
          type={type}
          onBlur={onBlur}
          className={`w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border ${getBorderColor()} focus:ring-2 text-white placeholder-gray-400 transition duration-200 ${
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

export default PasswordInput;
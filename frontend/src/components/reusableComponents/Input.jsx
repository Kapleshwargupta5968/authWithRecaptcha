import { useFormContext } from "react-hook-form";

const Input = ({ label, type, name, register: propRegister, rules, error: propError, ...rest }) => {
    const method = useFormContext();
    
    // Determine whether to use FormProvider context or fallback to props
    const activeRegister = method ? method.register : propRegister;
    const activeError = method ? method.formState.errors[name] : propError;

    return (
        <div className="flex flex-col gap-1 w-full">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
                type={type}
                id={name}
                name={name}
                {...(activeRegister ? activeRegister(name, rules) : {})}
                {...rest}
                className={`border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {activeError && <p className="text-red-500 text-sm">{activeError.message}</p>}
        </div>
    )
}

export default Input;
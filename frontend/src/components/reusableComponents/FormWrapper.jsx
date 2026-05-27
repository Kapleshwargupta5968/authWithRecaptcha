import React from "react";
import { FormProvider } from "react-hook-form";

const FormWrapper = ({ title, description, children, onSubmit, methods }) => {
    const formContent = (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                    {title}
                </h2>
                {description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {description}
                    </p>
                )}
            </div>
            
            {onSubmit ? (
                <form onSubmit={methods ? methods.handleSubmit(onSubmit) : onSubmit} className="space-y-5" noValidate>
                    {children}
                </form>
            ) : (
                <div className="space-y-5">
                    {children}
                </div>
            )}
        </div>
    );

    return methods ? (
        <FormProvider {...methods}>
            {formContent}
        </FormProvider>
    ) : formContent;
};

export default FormWrapper;
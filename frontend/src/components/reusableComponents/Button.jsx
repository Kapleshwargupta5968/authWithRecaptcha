const Button = ({ children, type = "submit", onClick, className = "", disabled = false, icon = null }) => {
    return (
        <button type={type} onClick={onClick} className={`px-4 py-2 rounded-md ${className}`} disabled={disabled}>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    )
}

export default Button

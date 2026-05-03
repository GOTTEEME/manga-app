export default function LoadingSpinner({ size = "md", text = "กำลังโหลด..." }) {
  const sizeClasses = { sm: "w-5 h-5", md: "w-10 h-10", lg: "w-14 h-14" };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-primary`} />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
}

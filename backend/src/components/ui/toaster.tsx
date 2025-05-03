import { useToast } from "../hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="bg-[#fffbe3] text-black border-2 border-black shadow-[4px_4px_0_0_#000] px-4 py-3 rounded-xl font-semibold"
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="text-lg">{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-black hover:text-red-500" />
          </Toast>
        );
      })}
      <ToastViewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-[9999]" />
    </ToastProvider>
  );
}

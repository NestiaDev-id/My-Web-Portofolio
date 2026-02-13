import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="dark-mode-switch"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="data-[state=checked]:bg-slate-950 data-[state=unchecked]:bg-slate-200 border-2 border-transparent"
        thumbContent={
          <motion.div
            key={isDark ? "moon" : "sun"}
            initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-full h-full"
          >
            {isDark ? (
              <Moon className="h-4 w-4 " fill="currentColor" />
            ) : (
              <Sun className="h-4 w-4 text-orange-500" fill="currentColor" />
            )}
          </motion.div>
        }
      />
      <Label htmlFor="dark-mode-switch" className="sr-only">Toggle Theme</Label>
    </div>
  );
}

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "../../../lib/middlewares/utils";
import { motion } from "framer-motion";

interface ContentCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContentCard({
  title,
  description,
  children,
  className,
}: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("neo-card rounded-none", className)}>
        <CardHeader className="px-6 py-5 bg-[#FFB6F7] border-b-2 border-black">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {description && (
            <CardDescription className="font-medium text-black/70">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

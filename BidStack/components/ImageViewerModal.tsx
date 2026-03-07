"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title: string;
  subtitle?: string;
}

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
}: ImageViewerModalProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-100">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex items-center justify-center bg-slate-950 p-6 max-h-[calc(90vh-120px)] overflow-auto">
              {imageUrl && !imageError ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={imageUrl}
                  alt={title}
                  className="max-w-full max-h-full rounded-lg shadow-xl"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-slate-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-slate-400">
                    {imageError ? "Image failed to load" : "No image available"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-800/50 border-t border-slate-700 px-6 py-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 hover:bg-slate-700 text-slate-300"
                onClick={onClose}
              >
                Close
              </Button>
              {imageUrl && !imageError && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => window.open(imageUrl, "_blank")}
                >
                  Open Full Size
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

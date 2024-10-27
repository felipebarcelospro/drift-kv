"use client";

import { Card } from "@/components/ui/card";
import { config } from "@/configs/application";
import { motion } from "framer-motion";

export function FeaturesSection() {
  return (
    <motion.section
      id="features"
      className="mb-12 sm:mb-16 md:mb-24"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
    >
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Key Features
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {config.features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="p-6 sm:p-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <motion.div
                    className="bg-primary/10 p-2 sm:p-3 rounded-full mr-3 sm:mr-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-semibold">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

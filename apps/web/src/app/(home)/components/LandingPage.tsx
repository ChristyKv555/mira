"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Zap, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Layers,
    title: "Aggregate Tasks",
    description: "Connect all your task sources in one place",
  },
  {
    icon: Sparkles,
    title: "AI Prioritization",
    description: "Let AI intelligently prioritize what matters most",
  },
  {
    icon: Zap,
    title: "Stay Organized",
    description: "Keep everything organized and never miss a deadline",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              Your AI Co-Task Manager
            </motion.span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Organize Tasks.
            <br />
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Prioritize Smartly.
            </span>
            <br />
            Achieve More.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Mira uses AI to aggregate and prioritize tasks from different source
            channels, helping you stay organized and focused on what truly
            matters.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 mt-20"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            variants={itemVariants}
            className="mt-20 p-8 rounded-2xl border bg-card/30 backdrop-blur-sm"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              Why Choose Mira?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[
                "Connect tasks from multiple channels",
                "AI-powered intelligent prioritization",
                "Never miss important deadlines",
                "Stay organized effortlessly",
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants} className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Task Management?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of users who are already organized with Mira
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8"
                asChild
              >
                <Link href="/login">Sign In to Your Account</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

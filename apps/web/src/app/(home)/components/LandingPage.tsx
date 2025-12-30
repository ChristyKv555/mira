"use client";

import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Plug,
  MessageSquare,
  Wand2,
  Layers,
  CheckCircle2,
  Zap,
  Clock,
  Target,
  Brain,
  BarChart3,
  Mail,
  Calendar,
  MessageCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

const features = [
  {
    icon: Plug,
    title: "Connect Multiple Platform Integrations",
    description:
      "Seamlessly integrate with your favorite platforms including Gmail, Slack, Jira, Calendar, and more. Bring all your tasks into one unified workspace.",
    benefits: [
      "One-click integrations",
      "Real-time synchronization",
      "Secure API connections",
    ],
  },
  {
    icon: MessageSquare,
    title: "Ask AI About Your Tasks",
    description:
      "Get instant answers about your tasks. Ask questions like 'What's due this week?' or 'Which tasks are most urgent?' and let AI help you stay informed.",
    benefits: [
      "Natural language queries",
      "Instant insights",
      "Context-aware responses",
    ],
  },
  {
    icon: Wand2,
    title: "AI-Powered Task Generation",
    description:
      "Let AI automatically generate and organize tasks from your emails, messages, and calendar events. Never miss an important task again.",
    benefits: [
      "Automatic extraction",
      "Smart categorization",
      "Intelligent tagging",
    ],
  },
  {
    icon: Layers,
    title: "Smart Aggregation & Prioritization",
    description:
      "AI intelligently aggregates tasks from all your sources and prioritizes them based on deadlines, importance, and your work patterns.",
    benefits: [
      "Dynamic prioritization",
      "Pattern recognition",
      "Deadline awareness",
    ],
  },
];

const integrations = [
  { name: "Gmail", icon: Mail },
  { name: "Slack", icon: MessageCircle },
  { name: "Calendar", icon: Calendar },
  { name: "Jira", icon: FileText },
];

const stats = [
  { value: "10+", label: "Platform Integrations" },
  { value: "24/7", label: "AI Assistance" },
  { value: "99%", label: "Accuracy Rate" },
  { value: "5min", label: "Setup Time" },
];

const howItWorks = [
  {
    step: "01",
    title: "Connect Your Platforms",
    description:
      "Link your favorite productivity tools and platforms. Mira securely connects to your accounts and starts syncing tasks automatically.",
  },
  {
    step: "02",
    title: "AI Analyzes & Organizes",
    description:
      "Our AI engine processes all your tasks, understands context, deadlines, and priorities. It learns your work patterns to provide better insights.",
  },
  {
    step: "03",
    title: "Get Smart Recommendations",
    description:
      "Receive intelligent task prioritization, deadline alerts, and actionable insights. Ask questions and get instant answers about your workload.",
  },
  {
    step: "04",
    title: "Focus on What Matters",
    description:
      "With everything organized and prioritized, you can focus on high-impact work while Mira handles the complexity of task management.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const featureCardVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const floatingVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative container mx-auto px-4 py-20 md:py-32 min-h-screen flex items-center"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          />
          <motion.div
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          style={{ y, opacity }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-5xl mx-auto text-center z-10"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              Your AI Co-Task Manager
            </motion.span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="bg-linear-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              Organize Tasks.
            </span>
            <br />
            <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Prioritize Smartly.
            </span>
            <br />
            <span className="bg-linear-to-r from-foreground/80 via-foreground/60 to-foreground/40 bg-clip-text text-transparent">
              Achieve More.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Mira uses advanced AI to aggregate and prioritize tasks from
            different source channels, helping you stay organized and focused on
            what truly matters. Experience intelligent task management like
            never before.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="text-lg px-10 py-6" asChild>
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Integrations Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Works with Your Favorite Tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect seamlessly with the platforms you already use
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:shadow-lg transition-all duration-300 text-center group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="font-medium">{integration.name}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage tasks intelligently and efficiently
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={featureCardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group relative p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/90 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 bg-muted/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and transform your task management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="p-6 rounded-2xl border bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full">
                  <div className="text-5xl font-bold text-primary/20 mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border transform -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Mira?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of task management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Intelligence",
                description:
                  "Advanced machine learning algorithms understand your work patterns and adapt to your needs.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Real-time synchronization across all platforms ensures you always have the latest information.",
              },
              {
                icon: Target,
                title: "Focus on Priorities",
                description:
                  "Smart prioritization helps you focus on what matters most, reducing decision fatigue.",
              },
              {
                icon: Clock,
                title: "Save Time",
                description:
                  "Automate task extraction and organization, saving hours every week on manual work.",
              },
              {
                icon: BarChart3,
                title: "Actionable Insights",
                description:
                  "Get detailed analytics and insights about your productivity patterns and workload.",
              },
              {
                icon: CheckCircle2,
                title: "Never Miss Deadlines",
                description:
                  "Intelligent deadline tracking and alerts ensure you stay on top of important dates.",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-12 rounded-3xl border bg-linear-to-br from-card/80 to-card/50 backdrop-blur-sm"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of professionals who are already using Mira to stay
              organized and productive.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="text-lg px-10 py-6" asChild>
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

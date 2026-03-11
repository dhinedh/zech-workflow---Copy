"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Shield,
  Zap,
  Moon,
  Sun,
  BarChart3,
  Clock,
  Users,
  ZapIcon,
  MousePointer2,
  ChevronRight,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98]
      }
    }
  }

  return (
    <div className={cn(
      "flex flex-col min-h-screen transition-colors duration-700 selection:bg-[#C0FF00]/30",
      isDark ? "bg-[#050505] text-white" : "bg-white text-slate-900"
    )}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {isDark ? (
          <>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#C0FF00]/10 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.12, 0.1]
              }}
              transition={{ duration: 15, repeat: Infinity, delay: 2 }}
              className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#f0f4ff_0%,transparent_50%)]" />
        )}
      </div>

      {/* Navigation */}
      <header className={cn(
        "px-6 lg:px-12 h-20 flex items-center border-b fixed w-full z-50 transition-all duration-500 backdrop-blur-md",
        isDark ? "bg-black/40 border-white/5" : "bg-white/40 border-gray-100"
      )}>
        <Link className="flex items-center gap-3 group" href="/">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl transition-all duration-500 group-hover:rotate-6",
            isDark ? "bg-[#C0FF00] text-black shadow-[0_0_25px_#C0FF00]/40" : "bg-black text-white"
          )}>
            Z
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic">Zech.OS</span>
        </Link>

        <nav className="ml-auto hidden lg:flex gap-10">
          {['Product', 'Solution', 'Enterprise', 'Pricing'].map((item) => (
            <Link
              key={item}
              className={cn(
                "text-xs font-black uppercase tracking-widest transition-all hover:scale-105",
                isDark ? "text-gray-500 hover:text-[#C0FF00]" : "text-slate-500 hover:text-black"
              )}
              href="#"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="ml-12 flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "rounded-full transition-all duration-300",
              isDark ? "bg-white/5 text-[#C0FF00] hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button asChild variant="ghost" className="hidden sm:inline-flex font-bold text-xs uppercase tracking-widest">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className={cn(
            "font-black text-xs uppercase tracking-widest h-10 px-8 rounded-full transition-all active:scale-95 shadow-xl",
            isDark ? "bg-[#C0FF00] text-black hover:bg-white" : "bg-black text-white hover:bg-indigo-600"
          )}>
            <Link href="/register">Start Now</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 container px-6 mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center space-y-12"
          >
            {/* V2 Badge */}
            <motion.div variants={itemVariants}>
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-[0.2em] transition-all",
                isDark ? "bg-[#C0FF00]/10 border-[#C0FF00]/30 text-[#C0FF00]" : "bg-black text-white border-black shadow-lg"
              )}>
                <ZapIcon className="h-3 w-3 fill-current" />
                V2.8 NOW AVAILABLE
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants} className="max-w-4xl">
              <h1 className={cn(
                "text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter uppercase italic",
                isDark ? "text-white" : "text-black"
              )}>
                The Enterprise OS for <br />
                <span className={isDark ? "text-[#C0FF00]" : "text-indigo-600"}>Modern Agencies</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className={cn(
                "mx-auto max-w-2xl text-lg font-bold tracking-tight leading-relaxed",
                isDark ? "text-gray-500" : "text-slate-500"
              )}
            >
              Unified workflow management for high-growth digital teams.
              Real-time resource allocation, automated client transparency, and precision reporting.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6">
              <Button size="lg" className={cn(
                "h-16 px-12 text-sm font-black uppercase tracking-widest rounded-full shadow-2xl transition-all active:scale-95",
                isDark ? "bg-[#C0FF00] text-black hover:bg-white" : "bg-black text-white hover:bg-indigo-600"
              )} asChild>
                <Link href="/register">
                  Deploy Workflow
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className={cn(
                "h-16 px-12 text-sm font-black uppercase tracking-widest rounded-full border-2 transition-all active:scale-95",
                isDark ? "border-white/10 text-white hover:bg-white/5" : "border-slate-800 text-slate-800 hover:bg-slate-50"
              )}>
                Contact Enterprise
              </Button>
            </motion.div>

            {/* Mock Dashboard Mockup */}
            <motion.div
              variants={itemVariants}
              className="w-full max-w-2xl mt-8"
            >
              <div className={cn(
                "rounded-3xl border shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700",
                isDark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-slate-200"
              )}>
                {/* Browser Header */}
                <div className={cn(
                  "h-12 flex items-center px-6 border-b",
                  isDark ? "bg-[#111] border-white/5" : "bg-slate-50 border-slate-100"
                )}>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400 opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400 opacity-80" />
                  </div>
                  <div className={cn(
                    "mx-auto text-[9px] font-black tracking-[0.4em] uppercase opacity-30",
                    isDark ? "text-white" : "text-black"
                  )}>ZECH_DASHBOARD_V2.PRVIEW</div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 flex gap-4 min-h-[340px]">
                  {/* Left Sidebar Mockup */}
                  <div className="w-16 flex flex-col items-center gap-4 py-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all",
                          isDark ? "bg-white/5 border border-white/5" : "bg-slate-100 border border-slate-200",
                          i === 0 && (isDark ? "bg-[#C0FF00]/10 border-[#C0FF00]/20" : "bg-black/5")
                        )}
                        style={{ opacity: 1 - i * 0.1 }}
                      />
                    ))}
                  </div>

                  {/* Main Grid Mockup */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                      {/* Stat Card 1 */}
                      <div className={cn(
                        "col-span-8 h-20 rounded-2xl p-4 relative overflow-hidden",
                        isDark ? "bg-white/2 border border-white/5" : "bg-indigo-50/20 border border-indigo-100"
                      )}>
                        <div className={cn("w-20 h-2 rounded-full", isDark ? "bg-[#C0FF00]/20" : "bg-indigo-600/10")} />
                        <div className={cn("mt-2 w-32 h-4 rounded-full", isDark ? "bg-white/5" : "bg-slate-200")} />
                      </div>
                      {/* Status Ring Card */}
                      <div className={cn(
                        "col-span-4 h-20 rounded-2xl flex items-center justify-center relative",
                        isDark ? "bg-white/2 border border-white/5" : "bg-slate-100 border border-slate-200"
                      )}>
                        <div className={cn(
                          "w-10 h-10 rounded-full border-[3px] flex items-center justify-center",
                          isDark ? "border-[#C0FF00]/20" : "border-indigo-100"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", isDark ? "bg-[#C0FF00]" : "bg-indigo-600")} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 h-44">
                      {/* Feed Card */}
                      <div className={cn(
                        "col-span-4 h-full rounded-2xl p-4 space-y-3",
                        isDark ? "bg-white/2 border border-white/5" : "bg-slate-100 border border-slate-200"
                      )}>
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("h-4 rounded-md", isDark ? "bg-white/5" : "bg-white")} style={{ width: `${Math.random() * 40 + 60}%` }} />
                        ))}
                      </div>
                      {/* Giant Chart Stat Card */}
                      <div className={cn(
                        "col-span-8 h-full rounded-2xl relative overflow-hidden p-8 flex flex-col justify-between",
                        isDark ? "bg-white/2 border border-white/5" : "bg-slate-50 border border-slate-200 shadow-inner"
                      )}>
                        <div className="space-y-1">
                          <div className={cn("text-3xl font-black tracking-tighter italic", isDark ? "text-white" : "text-black")}>$128,402.00</div>
                          <div className={cn("text-[8px] font-black uppercase tracking-widest", isDark ? "text-[#C0FF00]" : "text-indigo-600")}>Revenue Matrix // ACTIVE</div>
                        </div>
                        {/* Mock Graph Data Visualization */}
                        <div className="absolute inset-0 pt-20 pointer-events-none">
                          <div className={cn(
                            "h-full w-full",
                            isDark ? "bg-gradient-to-t from-[#C0FF00]/10 to-transparent" : "bg-gradient-to-t from-indigo-500/10 to-transparent"
                          )} style={{ clipPath: 'polygon(0% 100%, 0% 85%, 15% 70%, 30% 90%, 45% 40%, 60% 70%, 75% 30%, 90% 45%, 100% 10%, 100% 100%)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Matrix */}
        <section className={cn(
          "py-32 relative overflow-hidden",
          isDark ? "bg-[#050505]" : "bg-slate-50"
        )}>
          <div className="container px-6 mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Zap className="h-8 w-8 text-[#C0FF00]" />,
                  title: "Streamlined Workflows",
                  desc: "Automated daily reporting and intelligent time tracking to keep your team focused on delivery."
                },
                {
                  icon: <Shield className="h-8 w-8 text-indigo-400" />,
                  title: "Enterprise Security",
                  desc: "Role-based access control, comprehensive audit logs, and bank-grade encryption."
                },
                {
                  icon: <Globe className="h-8 w-8 text-emerald-400" />,
                  title: "Unified Portal",
                  desc: "A premium client experience for tracking progress, approving milestones, and maintaining transparency."
                }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-10 rounded-3xl border group transition-all duration-500 hover:scale-[1.02]",
                    isDark ? "bg-white/2 border-white/5 hover:border-[#C0FF00]/30" : "bg-white border-slate-200 hover:shadow-2xl shadow-slate-100"
                  )}
                >
                  <div className={cn("mb-6 p-4 rounded-xl inline-flex", isDark ? "bg-[#C0FF00]/5" : "bg-slate-50")}>
                    {feat.icon}
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{feat.title}</h3>
                  <p className={cn("font-medium leading-relaxed", isDark ? "text-gray-500" : "text-slate-500")}>
                    {feat.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={cn(
              "rounded-3xl p-12 md:p-24 text-center space-y-10 relative overflow-hidden",
              isDark ? "bg-[#C0FF00] text-black shadow-[0_0_100px_rgba(192,255,0,0.2)]" : "bg-black text-white"
            )}
          >
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Ready to scale <br /> your agency?
            </h2>
            <Button size="lg" className={cn(
              "h-16 px-12 text-sm font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-2xl",
              isDark ? "bg-black text-white hover:bg-white hover:text-black" : "bg-[#C0FF00] text-black hover:bg-white"
            )} asChild>
              <Link href="/register">Initialize Setup Now</Link>
            </Button>

            {/* Dynamic background element for CTA */}
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <ZapIcon className="h-64 w-64 rotate-12" />
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className={cn(
        "py-16 border-t",
        isDark ? "bg-[#050505] border-white/5" : "bg-white border-slate-100"
      )}>
        <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black", isDark ? "bg-[#C0FF00] text-black" : "bg-black text-white")}>Z</div>
              <span className="font-black tracking-tighter uppercase italic">Zech.OS</span>
            </div>
            <p className={cn("text-xs font-bold tracking-widest opacity-40", isDark ? "text-white" : "text-black")}>© 2026 ZECH WORKFLOW INC.</p>
          </div>

          <nav className="flex gap-10">
            {['Terms', 'Privacy', 'Legal', 'Security'].map(link => (
              <Link
                key={link}
                href="#"
                className={cn("text-[10px] font-black uppercase tracking-widest transition-colors hover:text-[#C0FF00]", isDark ? "text-gray-600" : "text-slate-400")}
              >
                {link}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}

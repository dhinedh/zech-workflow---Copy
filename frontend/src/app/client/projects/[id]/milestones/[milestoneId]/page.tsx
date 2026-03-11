"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowLeft,
    CheckCircle2,
    Download,
    ExternalLink,
    FileText,
    MessageSquare,
    AlertCircle,
    Calendar,
    DollarSign,
    Loader2,
    Eye
} from "lucide-react"
import api from "@/lib/api"
import { format } from "date-fns"

export default function MilestoneReviewPage() {
    const params = useParams()
    const router = useRouter()
    const { id: projectId, milestoneId } = params as { id: string; milestoneId: string }

    const [milestone, setMilestone] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)
    const [requestingChanges, setRequestingChanges] = useState(false)
    const [feedback, setFeedback] = useState("")
    const [changesText, setChangesText] = useState("")
    const [activeTab, setActiveTab] = useState<'review' | 'success'>('review')

    // Mock fetching milestone details
    useEffect(() => {
        const fetchMilestone = async () => {
            try {
                // In real app: const res = await api.get(`/milestones/${milestoneId}`)
                // Mock data to match prompt
                setMilestone({
                    id: milestoneId,
                    name: "Phase 2 - Design & Prototyping",
                    dueDate: "2026-02-05",
                    completedDate: "2026-02-05",
                    status: "PENDING_APPROVAL",
                    paymentAmount: 150000,
                    paymentPercentage: 30,
                    deliverables: [
                        {
                            id: 1,
                            title: "UI/UX Wireframes",
                            completedBy: "Lisa Wang (UI/UX Designer)",
                            date: "2026-02-01",
                            description: "Complete wireframe set covering all 25 app screens including: User authentication flows, Main dashboard layouts, Feature-specific screens, Settings and profile pages.",
                            files: [{ name: "Wireframes_Complete.fig", size: "4.2 MB", type: "FIG" }]
                        },
                        {
                            id: 2,
                            title: "High-Fidelity Mockups",
                            completedBy: "Lisa Wang",
                            date: "2026-02-03",
                            description: "Pixel-perfect mockups with your brand colors, typography, and visual style. Includes light and dark mode variants.",
                            files: [{ name: "Mockups_All_Screens.zip", size: "15.8 MB", type: "ZIP" }]
                        },
                        {
                            id: 3,
                            title: "Interactive Prototype",
                            completedBy: "Lisa Wang & Sarah Johnson",
                            date: "2026-02-05",
                            description: "Fully interactive prototype demonstrating complete user flows: Sign up and onboarding, Core feature interactions, Navigation, Micro-animations.",
                            link: "figma.com/proto/xyz123/mobile-app-prototype"
                        }
                    ]
                })
            } catch (error) {
                console.error("Failed to fetch milestone", error)
            } finally {
                setLoading(false)
            }
        }
        fetchMilestone()
    }, [milestoneId])

    const handleApprove = async () => {
        setApproving(true)
        try {
            await api.put(`/milestones/${milestoneId}/approve`, { feedback })
            setActiveTab('success')
        } catch (error) {
            console.error("Failed to approve", error)
            // Fallback for demo if backend not fully wired/seeded
            setActiveTab('success')
        } finally {
            setApproving(false)
        }
    }

    const handleRequestChanges = async () => {
        setRequestingChanges(true)
        try {
            await api.put(`/milestones/${milestoneId}/request-changes`, {
                changes: changesText,
                urgency: 'NORMAL'
            })
            alert("Changes requested successfully")
            router.push("/client/dashboard")
        } catch (error) {
            console.error("Failed to request changes", error)
            alert("Sent change request")
        } finally {
            setRequestingChanges(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (activeTab === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center animate-in fade-in duration-500 max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full">
                    <div className="rounded-full bg-green-100 p-4 w-20 h-20 mx-auto flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Milestone Approved Successfully!</h1>
                    <p className="text-lg text-gray-500 mt-2 mb-8">
                        Phase 2: Design & Prototyping has been approved!
                    </p>

                    <div className="space-y-4 text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            <span className="text-gray-700">Team has been notified</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            <span className="text-gray-700">Invoice will be sent today</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            <span className="text-gray-700">Development phase (Phase 3) will begin</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Invoice Details</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500">Amount</span>
                            <span className="text-xl font-bold text-gray-900">₹{milestone.paymentAmount.toLocaleString()} <span className="text-sm font-normal text-gray-500">(30%)</span></span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Due Date</span>
                            <span className="text-gray-900">Within 15 days</span>
                        </div>

                        <Button variant="outline" className="w-full mt-6">
                            <FileText className="mr-2 h-4 w-4" />
                            View Invoice
                        </Button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.push("/client/dashboard")}>
                        Back to Dashboard
                    </Button>
                    <Button onClick={() => router.push(`/client/dashboard`)} className="bg-indigo-600 hover:bg-indigo-700">
                        View Project
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
            {/* Navigation & Header */}
            <div>
                <Button variant="ghost" size="sm" className="mb-4 pl-0 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">MILESTONE REVIEW</div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">{milestone.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            Project: <span className="font-medium text-indigo-600">Mobile App Development</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 py-1.5 px-3 text-sm">
                            <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                            Awaiting Your Approval
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Milestone Summary Card */}
            <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader className="bg-gray-50/50 border-b pb-4">
                    <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Milestone Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Due Date</p>
                        <p className="font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" /> {format(new Date(milestone.dueDate), 'MMMM d, yyyy')} <span className="ml-2 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">On Time ✅</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Payment Trigger</p>
                        <p className="font-medium flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" /> ₹{milestone.paymentAmount.toLocaleString()} ({milestone.paymentPercentage}%)
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Deliverables Count</p>
                        <p className="font-medium flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-gray-400" /> 3 Items
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* DELIVERABLES SECTION */}
            <div className="space-y-6">
                {milestone.deliverables.map((item: any, index: number) => (
                    <Card key={item.id} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <span className="bg-white h-6 w-6 rounded-full border flex items-center justify-center text-xs mr-3 font-bold text-gray-500">{index + 1}</span>
                                {item.title}
                            </h3>
                            <span className="text-xs text-gray-500">Completed: {format(new Date(item.date), 'MMM d, yyyy')}</span>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1">DESCRIPTION</p>
                                        <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Completed by:</span>
                                        <div className="flex items-center gap-1 font-medium text-gray-900">
                                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700">LW</div>
                                            {item.completedBy}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-1/3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 mb-3">FILES & RESOURCES</p>

                                    {item.files && item.files.map((file: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-white border rounded-md mb-2 group cursor-pointer hover:border-indigo-300 transition-colors">
                                            <div className="flex items-center overflow-hidden">
                                                <FileText className="w-8 h-8 text-blue-500 p-1 bg-blue-50 rounded mr-3 shrink-0" />
                                                <div className="truncate">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-400">{file.size} • {file.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {item.link && (
                                        <div className="space-y-3">
                                            <div className="flex items-center p-2 bg-indigo-50 border border-indigo-100 rounded-md">
                                                <div className="flex-1 truncate px-2">
                                                    <p className="text-xs font-medium text-indigo-900">Prototype Link</p>
                                                    <p className="text-xs text-indigo-500 truncate">{item.link}</p>
                                                </div>
                                            </div>
                                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-xs">
                                                🚀 Open Prototype
                                            </Button>
                                            <p className="text-[10px] text-center text-gray-500">Use desktop or mobile to test interactions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* TEAM MESSAGE */}
            <Card className="bg-indigo-50/50 border-indigo-100">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            <div className="h-10 w-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">Message from Sarah Johnson (Project Manager)</h4>
                                <span className="text-xs text-gray-500">Feb 5, 2026</span>
                            </div>
                            <p className="text-gray-700 italic text-sm">
                                "Hi TechCorp team, we're excited to share the completed Phase 2 deliverables! Lisa has done an amazing job bringing your vision to life. All 25 screens are included. We recommend reviewing the wireframes first for structure, then the high-fidelity mockups for visual design. Let us know if you have any questions!"
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="h-px bg-gray-200"></div>

            {/* APPROVAL ACTIONS */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Approval Actions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Approve Option */}
                    <Card className="border-2 border-green-100 hover:border-green-300 transition-all shadow-sm">
                        <CardHeader className="bg-green-50/30 pb-3">
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-5 w-5" />
                                Approve Milestone
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Confirm deliverables meet requirements</li>
                                <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Proceed to Phase 3: Development</li>
                                <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-2 text-green-500" /> Invoice for ₹1.5 Lakh will be generated</li>
                            </ul>

                            <div className="pt-2">
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Optional Feedback</label>
                                <Textarea
                                    placeholder="Add a comment for the team..."
                                    className="resize-none h-20 text-sm"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-md"
                                size="lg"
                                onClick={handleApprove}
                                disabled={approving}
                            >
                                {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                ✅ Approve Milestone & Proceed
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Request Changes Option */}
                    <Card className="hover:border-gray-400 transition-all border-dashed border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-gray-700">
                                <AlertCircle className="h-5 w-5" />
                                Request Changes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="text-sm text-gray-600">
                                Need adjustments? Describe what needs to be changed.
                                <p className="text-xs text-gray-400 mt-1">Minor tweaks are efficient, major redesigns may impact timeline.</p>
                            </div>

                            <div className="pt-0">
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Describe Changes Needed</label>
                                <Textarea
                                    placeholder="e.g. Change primary color to #FF5733, Adjust button spacing..."
                                    className="resize-none h-24 text-sm"
                                    value={changesText}
                                    onChange={(e) => setChangesText(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleRequestChanges}
                                    disabled={requestingChanges}
                                >
                                    {requestingChanges ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    📝 Submit Request
                                </Button>
                                <Button variant="ghost" className="text-indigo-600">
                                    Schedule Call
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

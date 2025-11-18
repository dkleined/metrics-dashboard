'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LocationSection from '@/components/LocationSection';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';

type ProjectStats = {
    projectId: string;
    uniqueVisitors: number;
    totalPageViews: number;
    customEvents: Array<{ event_name: string; count: number }>;
    topPages: Array<{ path: string; views: number }>;
};

type DashboardData = {
    today: {
        uniqueVisitors: number;
        totalPageViews: number;
        customEvents: Array<{ event_name: string; count: number }>;
        topPages: Array<{ path: string; views: number }>;
        topCountries?: Array<{ country: string; visitors: number }>;
        topCities?: Array<{ city: string; region: string; country: string; visitors: number }>;
    };
    timeSeries: Array<{
        date: string;
        visitors: number;
        pageViews: number;
        events: number;
    }>;
    projects: ProjectStats[];
};

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [days, setDays] = useState(7);

    useEffect(() => {
        loadData(selectedProject, days);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async (projectId: string | null = null, daysParam: number = 7) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ days: daysParam.toString() });
            if (projectId) {
                params.append('projectId', projectId);
            }
            
            const response = await fetch(`/api/metrics?${params}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Failed to load metrics:', error);
            alert('Failed to load metrics data');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = (projectId: string | null) => {
        setSelectedProject(projectId);
        loadData(projectId, days);
    };

    const handleDaysChange = (newDays: number) => {
        setDays(newDays);
        loadData(selectedProject, newDays);
    };

    if (loading && !data) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white text-xl">Loading metrics...</p>
                </div>
            </main>
        );
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white text-xl mb-4">No data available</p>
                    <button 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold"
                        onClick={() => loadData(selectedProject, days)}
                    >
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    const totalEvents = data.today.customEvents.reduce((sum, e) => sum + e.count, 0);

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">📊 Metrics Dashboard</h1>
                        <p className="text-gray-400">Real-time analytics across all projects</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select
                            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedProject || 'all'}
                            onChange={(e) => handleProjectChange(e.target.value === 'all' ? null : e.target.value)}
                        >
                            <option value="all">All Projects</option>
                            {data.projects.map(p => (
                                <option key={p.projectId} value={p.projectId}>{p.projectId}</option>
                            ))}
                        </select>
                        <select
                            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={days}
                            onChange={(e) => handleDaysChange(parseInt(e.target.value))}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="14">Last 14 days</option>
                            <option value="30">Last 30 days</option>
                        </select>
                        <button 
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 font-bold"
                            onClick={() => loadData(selectedProject, days)}
                            disabled={loading}
                        >
                            {loading ? '⟳' : '↻'} Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Unique Visitors"
                        value={data.today.uniqueVisitors}
                        emoji="👥"
                        colorFrom="from-blue-600/20"
                        colorTo="to-blue-800/20"
                        borderColor="border-blue-500/30"
                    />
                    <StatCard
                        title="Page Views"
                        value={data.today.totalPageViews}
                        emoji="📄"
                        colorFrom="from-green-600/20"
                        colorTo="to-green-800/20"
                        borderColor="border-green-500/30"
                    />
                    <StatCard
                        title="Custom Events"
                        value={totalEvents}
                        emoji="⚡"
                        colorFrom="from-purple-600/20"
                        colorTo="to-purple-800/20"
                        borderColor="border-purple-500/30"
                    />
                </div>

                {/* Projects Overview - Always Visible */}
                {data.projects.length > 0 && (
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-8">
                        <h2 className="text-2xl font-black text-white mb-4">🚀 Projects Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {data.projects.map(project => {
                                const isSelected = selectedProject === project.projectId;
                                return (
                                    <div 
                                        key={project.projectId}
                                        className={`rounded-lg p-4 border-2 transition cursor-pointer select-none ${
                                            isSelected 
                                                ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500' 
                                                : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                                        }`}
                                        onClick={() => handleProjectChange(isSelected ? null : project.projectId)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-white">{project.projectId}</h3>
                                            {isSelected && <span className="text-blue-400 text-sm font-bold">✓ SELECTED</span>}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-gray-400">👥 {project.uniqueVisitors} visitors</p>
                                            <p className="text-gray-400">📄 {project.totalPageViews} views</p>
                                            <p className="text-gray-400">⚡ {project.customEvents.reduce((sum, e) => sum + e.count, 0)} events</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Time Series Chart */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-8">
                    <h2 className="text-2xl font-black text-white mb-4">📈 Trends</h2>
                    
                    {data.timeSeries && data.timeSeries.length > 0 ? (
                    <>
                    {/* Desktop: Chart */}
                    <div className="hidden md:block">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#9ca3af"
                                    tickFormatter={(date) => {
                                        const [year, month, day] = date.split('-');
                                        return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px' }}
                                    labelStyle={{ color: '#3b82f6' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="visitors" stroke="#3b82f6" name="Visitors" strokeWidth={3} />
                                <Line type="monotone" dataKey="pageViews" stroke="#10b981" name="Page Views" strokeWidth={3} />
                                <Line type="monotone" dataKey="events" stroke="#8b5cf6" name="Events" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Mobile: Simple Stats Grid */}
                    <div className="md:hidden space-y-4">
                        {data.timeSeries.slice(-7).map((day: any) => (
                            <div key={day.date} className="bg-gray-800 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2 font-bold">
                                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-500">Visitors</div>
                                        <div className="text-lg font-black text-blue-400">{day.visitors}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Views</div>
                                        <div className="text-lg font-black text-green-400">{day.pageViews}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Events</div>
                                        <div className="text-lg font-black text-purple-400">{day.events}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                    ) : (
                        <p className="text-gray-400 text-center py-12">No trend data available</p>
                    )}
                </div>

                {/* Top Countries */}
                <LocationSection
                    title="Top Countries"
                    emoji="🌍"
                    data={data.today.topCountries || []}
                    colorFrom="from-green-500"
                    colorTo="to-green-600"
                    emptyMessage="No country data yet - visit the site to generate location data!"
                />

                {/* Top Cities */}
                <LocationSection
                    title="Top Cities"
                    emoji="🏙️"
                    data={data.today.topCities || []}
                    colorFrom="from-purple-500"
                    colorTo="to-purple-600"
                    emptyMessage="No city data yet - visit the site to generate location data!"
                />

                {/* Top Pages - Always Visible */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h2 className="text-2xl font-black text-white mb-4">🔥 Top Pages</h2>
                    {data.today.topPages.length > 0 ? (
                        selectedProject ? (
                            // Single project view - simple list
                            <div className="space-y-3">
                                {data.today.topPages.slice(0, 10).map((page: any, index: number) => {
                                    const maxViews = data.today.topPages[0]?.views || 1;
                                    const percentage = (page.views / maxViews) * 100;
                                    return (
                                        <ProgressBar
                                            key={`${page.path}-${index}`}
                                            label={page.path}
                                            value={`${page.views} views`}
                                            percentage={percentage}
                                            colorFrom="from-blue-500"
                                            colorTo="to-blue-600"
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            // All projects view - grouped by project
                            <div className="space-y-6">
                                {Object.entries(
                                    data.today.topPages.reduce((acc: any, page: any) => {
                                        if (!acc[page.project_id]) acc[page.project_id] = [];
                                        acc[page.project_id].push(page);
                                        return acc;
                                    }, {})
                                ).slice(0, 3).map(([projectId, pages]: [string, any]) => {
                                    const projectPages = pages.slice(0, 3); // Top 3 per project
                                    const maxViews = projectPages[0]?.views || 1;
                                    return (
                                        <div key={projectId}>
                                            <h3 className="text-sm font-bold text-blue-400 uppercase mb-2">{projectId}</h3>
                                            <div className="space-y-3">
                                                {projectPages.map((page: any) => {
                                                    const percentage = (page.views / maxViews) * 100;
                                                    return (
                                                        <div key={`${projectId}-${page.path}`} className="space-y-1">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-300 font-medium truncate flex-1">{page.path}</span>
                                                                <span className="text-blue-400 font-bold ml-2">{page.views} views</span>
                                                            </div>
                                                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <p className="text-gray-400 text-center py-8">No page views yet</p>
                    )}
                </div>
            </div>
        </main>
    );
}

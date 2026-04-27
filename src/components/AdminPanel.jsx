import { useState, useEffect } from 'react'
import { Trash2, Download, Search, Calendar, User, Phone, Building2, Stethoscope, Users, HelpCircle, ArrowLeft, Globe2, Copy, Check, AlertTriangle, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:5000'
const ADMIN_TOKEN_KEY = 'medon_admin_token'
const ADMIN_EMAIL_KEY = 'medon_admin_email'
const LANDING_URL = 'https://medon.am'

const UTM_LINKS = [
  { key: 'instagram', label: 'Instagram', url: `${LANDING_URL}/?utm_source=instagram&utm_medium=social&utm_campaign=consultation` },
  { key: 'facebook', label: 'Facebook', url: `${LANDING_URL}/?utm_source=facebook&utm_medium=social&utm_campaign=consultation` },
  { key: 'linkedin', label: 'LinkedIn', url: `${LANDING_URL}/?utm_source=linkedin&utm_medium=social&utm_campaign=consultation` },
  { key: 'google', label: 'Google Search', url: `${LANDING_URL}/?utm_source=google&utm_medium=organic&utm_campaign=consultation` },
  { key: 'whatsapp', label: 'WhatsApp', url: `${LANDING_URL}/?utm_source=whatsapp&utm_medium=social&utm_campaign=consultation` }
]

export default function AdminPanel() {
  const LEADS_PER_PAGE = 100
  const [leads, setLeads] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '')
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem(ADMIN_EMAIL_KEY) || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [copiedKey, setCopiedKey] = useState('')
  const [activeTab, setActiveTab] = useState('history')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/leads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        handleLogout()
        setError('Session expired. Please sign in again.')
        return
      }

      const data = await response.json()
      setLeads(data)
    } catch (err) {
      setError('Failed to load leads')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchLeads()
    } else {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoggingIn(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'Login failed')
        return
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      localStorage.setItem(ADMIN_EMAIL_KEY, data.admin.email)
      setToken(data.token)
      setAdminEmail(data.admin.email)
      setPassword('')
      setError(null)
    } catch (err) {
      console.error(err)
      setLoginError('Login failed')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_EMAIL_KEY)
    setToken('')
    setAdminEmail('')
    setLeads([])
    setPassword('')
  }

  const deleteLead = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        handleLogout()
        setError('Session expired. Please sign in again.')
        return
      }

      setLeads(leads.filter(l => l.id !== id))
    } catch (err) {
      console.error('Failed to delete lead:', err)
      alert('Failed to delete lead')
    }
  }

  const exportData = () => {
    const columns = [
      ['id', 'ID'],
      ['date', 'Date'],
      ['source', 'Source'],
      ['name', 'Name'],
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['clinicName', 'Clinic Name'],
      ['specialization', 'Specialization'],
      ['teamSize', 'Team Size'],
      ['mainProblem', 'Main Problem'],
      ['currentTools', 'Current Tools'],
      ['trafficChannel', 'Traffic Channel'],
      ['trafficMedium', 'Traffic Medium'],
      ['trafficCampaign', 'Traffic Campaign'],
      ['trafficReferrer', 'Traffic Referrer']
    ]

    const escapeCsvValue = (value) => {
      const stringValue = value == null ? '' : String(value)
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    const rows = leads.map((lead) => ({
      id: lead.id,
      date: lead.date,
      source: lead.source,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      clinicName: lead.clinicName,
      specialization: lead.specialization,
      teamSize: lead.teamSize,
      mainProblem: lead.mainProblem,
      currentTools: lead.currentTools,
      trafficChannel: lead.trafficSource?.channel,
      trafficMedium: lead.trafficSource?.medium,
      trafficCampaign: lead.trafficSource?.campaign,
      trafficReferrer: lead.trafficSource?.referrer
    }))

    const csvContent = [
      columns.map(([, label]) => escapeCsvValue(label)).join(','),
      ...rows.map((row) => columns.map(([key]) => escapeCsvValue(row[key])).join(','))
    ].join('\n')

    const dataStr = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "medon_leads.csv")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const copyUtmLink = async (key, url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedKey(key)
      window.setTimeout(() => {
        setCopiedKey((currentKey) => (currentKey === key ? '' : currentKey))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      alert('Failed to copy link')
    }
  }

  const filteredLeads = leads.filter(lead =>
    Object.values(lead).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PER_PAGE))
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * LEADS_PER_PAGE,
    currentPage * LEADS_PER_PAGE
  )

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 font-inter flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2rem] shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-slate-900">Medon Admin Login</h1>
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                autoComplete="current-password"
                required
              />
            </div>

            {loginError ? (
              <p className="text-sm font-bold text-red-500">{loginError}</p>
            ) : null}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-black text-slate-900">Medon Admin <span className="text-blue-600">Panel</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm font-bold text-slate-500">
              {adminEmail}
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Total Leads</p>
            <p className="text-4xl font-black text-slate-900">{leads.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">New Today</p>
            <p className="text-4xl font-black text-blue-600">
              {leads.filter(l => {
                const leadDate = new Date(l.date)
                return !Number.isNaN(leadDate.getTime()) && leadDate.toDateString() === new Date().toDateString()
              }).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Modal Leads</p>
            <p className="text-4xl font-black text-cyan-600">{leads.filter(l => l.source === 'Modal').length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Submission History
          </button>
          <button
            onClick={() => setActiveTab('utm')}
            className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'utm'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            UTM Links
          </button>
        </div>

        {activeTab === 'utm' ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">UTM Links</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Copy campaign links for social media and search traffic tracking.
                </p>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Base URL: {LANDING_URL}
              </div>
            </div>

            <div className="space-y-4">
              {UTM_LINKS.map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col lg:flex-row lg:items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="w-full lg:w-40">
                    <div className="text-sm font-black text-slate-900">{item.label}</div>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-600 break-all">
                    {item.url}
                  </div>
                  <button
                    onClick={() => copyUtmLink(item.key, item.url)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700"
                  >
                    {copiedKey === item.key ? <Check size={16} /> : <Copy size={16} />}
                    {copiedKey === item.key ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-900">Submission History</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-slate-50 border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all w-full md:w-80"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                    <th className="px-8 py-4">Date / Source</th>
                    <th className="px-8 py-4">Contact</th>
                    <th className="px-8 py-4">Clinic Info</th>
                    <th className="px-8 py-4">Needs / Problems</th>
                    <th className="px-8 py-4">Traffic</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-bold">Loading leads...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center">
                        <div className="mb-2 flex justify-center text-red-500">
                          <AlertTriangle size={24} />
                        </div>
                        <p className="text-red-500 font-bold">{error}</p>
                        <button onClick={fetchLeads} className="mt-4 text-blue-600 font-bold hover:underline">Try Again</button>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center">
                        <div className="mb-2 flex justify-center text-slate-300">
                          <Inbox size={24} />
                        </div>
                        <p className="text-slate-400 font-bold">No leads found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                              <Calendar size={14} className="text-slate-400" />
                              {lead.date}
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit uppercase ${
                              lead.source === 'Modal' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {lead.source}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                              <User size={14} className="text-slate-400" />
                              {lead.name}
                            </div>
                            {lead.email ? (
                              <div className="text-slate-500 text-sm break-all">
                                {lead.email}
                              </div>
                            ) : null}
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                              <Phone size={14} className="text-slate-400" />
                              {lead.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            {lead.clinicName && (
                              <div className="flex items-center gap-2 text-slate-900 font-bold">
                                <Building2 size={14} className="text-slate-400" />
                                {lead.clinicName}
                              </div>
                            )}
                            {lead.specialization && (
                              <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Stethoscope size={14} className="text-slate-400" />
                                {lead.specialization}
                              </div>
                            )}
                            {lead.teamSize && (
                              <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Users size={14} className="text-slate-400" />
                                Team: {lead.teamSize}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-xs">
                          <div className="space-y-2">
                            {lead.mainProblem && (
                              <div className="text-slate-700 text-sm line-clamp-2 italic">
                                "{lead.mainProblem}"
                              </div>
                            )}
                            {lead.currentTools && (
                              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase">
                                <HelpCircle size={12} />
                                Uses: {lead.currentTools}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-xs">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                              <Globe2 size={14} className="text-slate-400" />
                              {lead.trafficSource?.channel || 'Unknown'}
                            </div>
                            {lead.trafficSource?.medium ? (
                              <div className="text-slate-500">
                                Medium: {lead.trafficSource.medium}
                              </div>
                            ) : null}
                            {lead.trafficSource?.campaign ? (
                              <div className="text-slate-500">
                                Campaign: {lead.trafficSource.campaign}
                              </div>
                            ) : null}
                            {lead.trafficSource?.referrer ? (
                              <div className="text-slate-400 text-xs break-all">
                                {lead.trafficSource.referrer}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && !error && filteredLeads.length > 0 ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-100 px-8 py-5 bg-slate-50/40">
                <p className="text-sm text-slate-500 font-bold">
                  Showing {(currentPage - 1) * LEADS_PER_PAGE + 1}-
                  {Math.min(currentPage * LEADS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="text-sm font-bold text-slate-500">
                    Page {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}

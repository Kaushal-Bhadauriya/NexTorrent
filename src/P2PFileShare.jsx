import React, { useState, useEffect } from 'react';
import { Upload, Download, Users, Share2, CheckCircle, FileText, Wifi, Search, Link2, Globe, TrendingUp, X, AlertCircle } from 'lucide-react';

const P2PFileShare = () => {
  const [files, setFiles] = useState([]);
  const [activeDownloads, setActiveDownloads] = useState([]);
  const [activePeers, setActivePeers] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    totalShared: 0,
    totalDownloaded: 0,
    peersHelped: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [similarFiles, setSimilarFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [magnetLink, setMagnetLink] = useState('');
  const [showMagnetInput, setShowMagnetInput] = useState(false);
  const [magnetError, setMagnetError] = useState('');

  // Search functionality
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Parse magnet link
  const parseMagnetLink = (magnetUrl) => {
    try {
      // Basic magnet link validation
      if (!magnetUrl.startsWith('magnet:?')) {
        throw new Error('Invalid magnet link format');
      }

      // Extract xt (exact topic - hash)
      const xtMatch = magnetUrl.match(/xt=urn:btih:([a-zA-Z0-9]+)/);
      if (!xtMatch) {
        throw new Error('Could not find info hash in magnet link');
      }

      // Extract dn (display name)
      const dnMatch = magnetUrl.match(/dn=([^&]+)/);
      const fileName = dnMatch ? decodeURIComponent(dnMatch[1]) : 'Unknown File';

      // Extract trackers
      const trackerMatches = magnetUrl.match(/tr=([^&]+)/g);
      const trackers = trackerMatches ? trackerMatches.length : 0;

      return {
        hash: xtMatch[1],
        name: fileName,
        trackers: trackers,
        valid: true
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  };

  // Handle magnet link submission
  const handleMagnetSubmit = () => {
    setMagnetError('');
    
    if (!magnetLink.trim()) {
      setMagnetError('Please enter a magnet link');
      return;
    }

    const parsed = parseMagnetLink(magnetLink);
    
    if (!parsed.valid) {
      setMagnetError(parsed.error);
      return;
    }

    // Create a new file entry from magnet link
    const newFile = {
      id: Date.now() + Math.random(),
      name: parsed.name,
      size: Math.floor(Math.random() * 5000000000) + 1000000000, // Random size 1-5GB
      totalChunks: Math.floor(Math.random() * 5000) + 1000,
      downloadedChunks: 0,
      peers: Math.floor(Math.random() * 100) + 50,
      uploadSpeed: 0,
      downloadSpeed: 0,
      status: 'ready',
      hash: parsed.hash,
      trackers: parsed.trackers,
      source: 'magnet'
    };

    setFiles(prev => [newFile, ...prev]);
    setMagnetLink('');
    setShowMagnetInput(false);
    setMagnetError('');

    // Show success message
    alert(`Successfully added: ${newFile.name}\nPeers: ${newFile.peers}\nTrackers: ${newFile.trackers}`);
  };

  // AI Content Summarization
  const generateAISummary = async (file) => {
    setIsAnalyzing(true);
    setSelectedFile(file);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const summaries = {
      'Ubuntu-24.04-desktop.iso': {
        type: 'Operating System',
        description: 'Latest Ubuntu Linux distribution with enhanced security features and improved desktop experience.',
        highlights: [
          'Kernel 6.8 with better hardware support',
          'GNOME 46 desktop environment',
          'Enhanced security with TPM 2.0 support',
          'Pre-installed productivity tools'
        ],
        size: '5.2 GB',
        recommendation: 'Perfect for developers and system administrators',
        safety: 'Verified',
        category: 'Software',
        similar: [
          { name: 'Debian-12-stable.iso', size: 4800000000, peers: 892, relevance: 95 },
          { name: 'Fedora-39-Workstation.iso', size: 5100000000, peers: 756, relevance: 92 },
          { name: 'Linux-Mint-21.3.iso', size: 4200000000, peers: 643, relevance: 88 }
        ]
      },
      'Open-Source-Movie-4K.mp4': {
        type: 'Video Content',
        description: 'High-quality 4K open-source film showcasing stunning cinematography and storytelling.',
        highlights: [
          '3840x2160 resolution at 60fps',
          'HDR10 color grading',
          'Dolby Atmos audio track',
          'Available under Creative Commons license'
        ],
        size: '8.5 GB',
        recommendation: 'Great for media enthusiasts and content creators',
        safety: 'Verified',
        category: 'Media',
        similar: [
          { name: 'Big-Buck-Bunny-4K.mp4', size: 7200000000, peers: 1124, relevance: 94 },
          { name: 'Sintel-UHD-Edition.mkv', size: 8900000000, peers: 876, relevance: 91 },
          { name: 'Tears-of-Steel-4K.mp4', size: 7800000000, peers: 734, relevance: 89 }
        ]
      }
    };

    // Generate generic summary for magnet links or unknown files
    const defaultSummary = {
      type: 'File',
      description: `This is a torrent file available in the network. ${file.source === 'magnet' ? 'Added via magnet link.' : 'Available for download.'}`,
      highlights: [
        `${file.totalChunks} chunks available`,
        `Currently ${file.peers} peers sharing`,
        file.trackers ? `${file.trackers} trackers configured` : 'Multiple tracker support',
        'P2P distributed download'
      ],
      size: formatBytes(file.size),
      recommendation: 'Check file details before downloading',
      safety: 'Unverified',
      category: 'Unknown',
      similar: []
    };

    const summary = summaries[file.name] || defaultSummary;
    setAiSummary(summary);
    setSimilarFiles(summary.similar);
    setIsAnalyzing(false);
  };

  const chunkFile = (file) => {
    const chunkSize = 256 * 1024;
    const chunks = Math.ceil(file.size / chunkSize);
    return {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      totalChunks: chunks,
      downloadedChunks: 0,
      file: file,
      peers: Math.floor(Math.random() * 50) + 10,
      uploadSpeed: 0,
      downloadSpeed: 0,
      status: 'ready'
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileData = chunkFile(file);
      setUploadedFiles(prev => [...prev, fileData]);
      setNetworkStats(prev => ({
        ...prev,
        totalShared: prev.totalShared + 1
      }));
    }
  };

  const startDownload = (fileData) => {
    const downloadId = Date.now() + Math.random();
    const download = {
      ...fileData,
      id: downloadId,
      status: 'downloading',
      progress: 0,
      downloadedChunks: 0,
      activePeers: Math.min(fileData.peers, 8)
    };

    setActiveDownloads(prev => [...prev, download]);
    setActivePeers(prev => prev + download.activePeers);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setActiveDownloads(prev => 
          prev.map(d => 
            d.id === downloadId 
              ? { ...d, status: 'completed', progress: 100, downloadSpeed: 0 }
              : d
          )
        );
        
        setActivePeers(prev => prev - download.activePeers);
        setNetworkStats(prev => ({
          ...prev,
          totalDownloaded: prev.totalDownloaded + 1,
          peersHelped: prev.peersHelped + download.activePeers
        }));

        setTimeout(() => {
          setActiveDownloads(prev => prev.filter(d => d.id !== downloadId));
        }, 2000);
      } else {
        const speed = (Math.random() * 5 + 2).toFixed(1);
        setActiveDownloads(prev => 
          prev.map(d => 
            d.id === downloadId 
              ? { 
                  ...d, 
                  progress: Math.min(progress, 100),
                  downloadedChunks: Math.floor((progress / 100) * d.totalChunks),
                  downloadSpeed: parseFloat(speed)
                }
              : d
          )
        );
      }
    }, 500);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const sampleFiles = [
    { name: 'Ubuntu-24.04-desktop.iso', size: 5200000000, peers: 1247 },
    { name: 'Open-Source-Movie-4K.mp4', size: 8500000000, peers: 892 },
    { name: 'Programming-Course-2024.zip', size: 3200000000, peers: 456 },
    { name: 'Game-Assets-Pack.tar.gz', size: 2100000000, peers: 324 },
    { name: 'Scientific-Dataset.csv', size: 1500000000, peers: 189 }
  ];

  useEffect(() => {
    setFiles(sampleFiles.map(f => chunkFile(f)));
  }, []);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-lg">
                <Share2 className="text-black" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">NexTorrent</h1>
                <p className="text-neutral-400">Peer-to-peer file distribution</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-neutral-800 px-5 py-3 rounded-lg border border-neutral-700">
              <Wifi className="text-white" size={20} />
              <div>
                <span className="text-white font-bold text-xl">{activePeers}</span>
                <p className="text-neutral-400 text-xs">Connected Peers</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-800 p-5 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="text-white" size={20} />
                <span className="text-sm text-neutral-300 font-medium">Shared</span>
              </div>
              <p className="text-4xl font-bold text-white">{networkStats.totalShared}</p>
            </div>
            <div className="bg-neutral-800 p-5 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Download className="text-white" size={20} />
                <span className="text-sm text-neutral-300 font-medium">Downloaded</span>
              </div>
              <p className="text-4xl font-bold text-white">{networkStats.totalDownloaded}</p>
            </div>
            <div className="bg-neutral-800 p-5 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-white" size={20} />
                <span className="text-sm text-neutral-300 font-medium">Peers Helped</span>
              </div>
              <p className="text-4xl font-bold text-white">{networkStats.peersHelped}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Magnet Link */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
              <div className="flex gap-3 mb-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-800 text-white pl-10 pr-4 py-3 rounded-lg border border-neutral-700 focus:border-neutral-600 focus:outline-none"
                  />
                </div>
                {/* Add Magnet Link Button */}
                <button
                  onClick={() => setShowMagnetInput(!showMagnetInput)}
                  className="bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Link2 size={20} />
                  Add Magnet
                </button>
              </div>

              {/* Magnet Link Input */}
              {showMagnetInput && (
                <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                  <div className="flex items-start gap-3 mb-3">
                    <Link2 className="text-white mt-3" size={20} />
                    <div className="flex-1">
                      <label className="text-white text-sm font-medium block mb-2">
                        Paste Magnet Link
                      </label>
                      <textarea
                        value={magnetLink}
                        onChange={(e) => setMagnetLink(e.target.value)}
                        placeholder="magnet:?xt=urn:btih:..."
                        className="w-full bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-neutral-600 focus:outline-none resize-none"
                        rows="3"
                      />
                      {magnetError && (
                        <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                          <AlertCircle size={16} />
                          <span>{magnetError}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowMagnetInput(false);
                        setMagnetLink('');
                        setMagnetError('');
                      }}
                      className="text-neutral-400 hover:text-white transition-colors mt-2"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowMagnetInput(false);
                        setMagnetLink('');
                        setMagnetError('');
                      }}
                      className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleMagnetSubmit}
                      className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add Torrent
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Upload size={24} className="text-white" />
                Share Files
              </h2>
              <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-neutral-600 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-neutral-500 mb-3" size={48} />
                  <p className="text-neutral-300 font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-neutral-500 mt-1">File will be distributed across the network</p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-white text-sm mb-2">Your Files</h3>
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-white" size={18} />
                        <div>
                          <p className="font-medium text-white text-sm">{file.name}</p>
                          <p className="text-xs text-neutral-400">{formatBytes(file.size)} • {file.totalChunks} chunks</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-neutral-300">Seeding</p>
                        <p className="text-xs text-neutral-500">{file.peers} peers</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Downloads */}
            {activeDownloads.length > 0 && (
              <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Download size={24} className="text-white" />
                  Active Downloads
                </h2>
                {activeDownloads.map(download => (
                  <div key={download.id} className="bg-neutral-800 rounded-lg p-4 mb-3 border border-neutral-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <FileText className="text-white" size={24} />
                        <div>
                          <p className="font-semibold text-white">{download.name}</p>
                          <p className="text-xs text-neutral-400">
                            {download.downloadedChunks}/{download.totalChunks} chunks • {download.activePeers} peers
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {download.status === 'completed' ? (
                          <CheckCircle className="text-white" size={24} />
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-white">{download.downloadSpeed} MB/s</p>
                            <p className="text-xs text-neutral-400">{download.progress.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          download.status === 'completed' ? 'bg-white' : 'bg-neutral-400'
                        }`}
                        style={{ width: `${download.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available Files */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe size={24} className="text-white" />
                Available Files {searchQuery && `(${filteredFiles.length})`}
              </h2>
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="text-neutral-700 mx-auto mb-4" size={56} />
                  <p className="text-neutral-400 font-medium">No files found</p>
                  <p className="text-neutral-500 text-sm mt-2">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFiles.map(file => (
                    <div key={file.id} className="border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 hover:bg-neutral-800/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-neutral-800 p-3 rounded-lg border border-neutral-700">
                            <FileText className="text-white" size={24} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{file.name}</p>
                            <p className="text-sm text-neutral-400">{formatBytes(file.size)} • {file.totalChunks} chunks</p>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <Users size={14} className="text-neutral-400" />
                                <span className="text-xs text-neutral-400 font-medium">{file.peers} peers</span>
                              </div>
                              {file.source === 'magnet' && (
                                <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded border border-neutral-700">
                                  Magnet Link
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => generateAISummary(file)}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-neutral-700"
                          >
                            View Info
                          </button>
                          <button
                            onClick={() => startDownload(file)}
                            className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Info Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-neutral-900 rounded-lg border border-neutral-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={24} className="text-white" />
                File Information
              </h2>

              {isAnalyzing ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-neutral-400 font-medium">Analyzing file...</p>
                </div>
              ) : aiSummary ? (
                <div className="space-y-4">
                  <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-neutral-400 text-xs font-semibold uppercase">{aiSummary.type}</span>
                      <span className={`text-xs px-3 py-1 rounded-full border ${
                        aiSummary.safety === 'Verified' 
                          ? 'bg-neutral-700 text-white border-neutral-600'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}>
                        {aiSummary.safety}
                      </span>
                    </div>
                    <h3 className="text-white font-bold mb-2">{selectedFile?.name}</h3>
                    <p className="text-neutral-300 text-sm leading-relaxed">{aiSummary.description}</p>
                  </div>

                  <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                    <h4 className="text-white font-bold mb-3 text-sm">Key Features</h4>
                    <ul className="space-y-2">
                      {aiSummary.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-neutral-300 text-sm flex items-start gap-2">
                          <span className="text-neutral-500 mt-1">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
                      <p className="text-neutral-400 text-xs font-semibold mb-1">Size</p>
                      <p className="text-white font-bold text-sm">{aiSummary.size}</p>
                    </div>
                    <div className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
                      <p className="text-neutral-400 text-xs font-semibold mb-1">Category</p>
                      <p className="text-white font-bold text-sm">{aiSummary.category}</p>
                    </div>
                  </div>

                  <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                    <p className="text-neutral-400 text-xs font-semibold mb-2 uppercase">Recommendation</p>
                    <p className="text-neutral-200 text-sm">{aiSummary.recommendation}</p>
                  </div>

                  {similarFiles.length > 0 && (
                    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                      <h4 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                        <TrendingUp size={16} />
                        Similar Content
                      </h4>
                      <div className="space-y-2">
                        {similarFiles.map((similar, idx) => (
                          <div 
                            key={idx} 
                            className="bg-neutral-900 rounded-lg p-3 border border-neutral-700 hover:border-neutral-600 transition-colors cursor-pointer"
                            onClick={() => startDownload(chunkFile(similar))}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-white text-sm font-medium flex-1">{similar.name}</p>
                              <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
                                {similar.relevance}% match
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400">{formatBytes(similar.size)}</span>
                              <div className="flex items-center gap-1">
                                <Users size={12} className="text-neutral-500" />
                                <span className="text-neutral-400">{similar.peers}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="text-neutral-700 mx-auto mb-4" size={56} />
                  <p className="text-neutral-400 font-medium">Select a file to view details</p>
                  <p className="text-neutral-500 text-sm mt-2">Click "View Info" on any file</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-neutral-900 rounded-lg border border-neutral-800 p-8">
          <h3 className="text-2xl font-bold text-white mb-6">How to Use</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <div className="bg-white p-3 rounded-lg inline-block mb-4">
                <Search className="text-black" size={24} />
              </div>
              <h4 className="text-white font-bold text-lg mb-3">Search Files</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Use the search bar to find files in the network. Type keywords to filter available torrents and find what you need quickly.
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <div className="bg-white p-3 rounded-lg inline-block mb-4">
                <Link2 className="text-black" size={24} />
              </div>
              <h4 className="text-white font-bold text-lg mb-3">Add Magnet Links</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Click "Add Magnet" to paste torrent magnet links. The system will automatically parse and add the torrent to your download list.
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
              <div className="bg-white p-3 rounded-lg inline-block mb-4">
                <Download className="text-black" size={24} />
              </div>
              <h4 className="text-white font-bold text-lg mb-3">Download & Share</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Download files from multiple peers simultaneously. Once downloaded, you automatically become a seeder, helping others download faster.
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <AlertCircle size={20} />
              Example Magnet Link Format
            </h4>
            <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700">
              <code className="text-neutral-300 text-xs break-all">
                magnet:?xt=urn:btih:HASH&dn=File+Name&tr=tracker1&tr=tracker2
              </code>
            </div>
            <p className="text-neutral-400 text-sm mt-3">
              Paste any valid magnet link to add torrents to your download queue. The system supports multiple trackers and will connect to available peers automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default P2PFileShare;

import { Shield, WifiOff, Users, Map, Cpu, Bot, GitBranch, KeyRound, Sun, CloudDrizzle, Languages, Building2 } from 'lucide-react';

// Main component for the project page
export default function TourGuard360Page() {
  // Data extracted from the PDF
  const projectInfo = {
    title: "TourGuard360",
    hackathon: "Smart India Hackathon 2025",
    problemStatement: "Smart Tourist Safety Monitoring & Incident Response System using AI, Geo-Fencing, and Digital ID",
    teamName: "System 404",
    description: "A comprehensive safety ecosystem combining AI-driven risk detection, privacy-preserving monitoring, mesh networking for offline reliability, and context-aware emergency response tailored for North Eastern Region tourism.",
  };

  const essentialFeatures = [
    { icon: <Shield className="h-8 w-8 text-blue-500" />, title: "SOS & Silent SOS", description: "One-tap emergency + covert distress signals for immediate help." },
    { icon: <Map className="h-8 w-8 text-green-500" />, title: "Dynamic Geo-Fencing", description: "Real-time safe/danger zone mapping to keep tourists aware." },
    { icon: <Bot className="h-8 w-8 text-purple-500" />, title: "AI Risk Detection", description: "Movement anomaly and incident classification for proactive safety." },
    { icon: <KeyRound className="h-8 w-8 text-yellow-500" />, title: "Digital ID Verification", description: "Secure tourist authentication using Aadhaar and DigiLocker." },
    { icon: <GitBranch className="h-8 w-8 text-red-500" />, title: "Emergency Response Chain", description: "Automated notifications to authorities for rapid response." },
    { icon: <WifiOff className="h-8 w-8 text-gray-500" />, title: "Offline Functionality", description: "Works without internet, crucial for remote areas." },
  ];

  const advancedFeatures = [
    { icon: <Cpu className="h-8 w-8 text-teal-500" />, title: "Privacy-Safe Wellness Checks", description: "On-device face expression & stress level detection." },
    { icon: <Users className="h-8 w-8 text-orange-500" />, title: "Crowd Density Analysis", description: "Real-time isolation vs. crowded area detection." },
    { icon: <Users className="h-8 w-8 text-indigo-500" />, title: "Mesh Emergency Relay", description: "Tourist-to-tourist message passing until online." },
    { icon: <Map className="h-8 w-8 text-lime-500" />, title: "Safe Corridor Navigation", description: "Optimal routing through verified safe paths." },
  ];
  
  const culturalFeatures = [
    { icon: <Languages className="h-8 w-8 text-sky-500" />, title: "Multilingual Support", description: "Includes local NER languages and voice guidance." },
    { icon: <CloudDrizzle className="h-8 w-8 text-slate-500" />, title: "Environmental Intelligence", description: "Alerts for landslides, floods, and weather risks." },
    { icon: <Building2 className="h-8 w-8 text-rose-500" />, title: "Safe Haven Network", description: "Database of 24/7 verified shops, police posts, and clinics." },
  ];

  const techStack = {
    "Mobile Application": "React Native, Redux, SQLite, OpenStreetMap",
    "Backend Infrastructure": "Node.js, Express.js, PostgreSQL, PostGIS, Redis, Kafka, AWS",
    "AI/ML": "TensorFlow.js, PyTorch, ML Kit, GeoPandas",
    "Emerging Tech": "Hyperledger Indy, IPFS, Zero-Knowledge Proofs, BLE Mesh",
    "APIs": "Aadhaar, DigiLocker, Google Maps, MapBox"
  };

  // The main JSX for the page
  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center bg-gray-800 p-4 rounded-xl mb-4">
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-green-400 to-orange-400">TourGuard360</span>
          </div>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">{projectInfo.hackathon}</p>
          <p className="text-md text-gray-500 mt-2">Team: {projectInfo.teamName}</p>
        </header>
        
        {/* Live Demo Button */}
        <div className="text-center mb-16">
          <a
            href="http://localhost:3500/admin"
            className="bg-cyan-800 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition-all duration-300 text-lg shadow-lg hover:shadow-green-500/50"
          >
            Go to Admin Panel
          </a>
        </div>

        {/* Overview Section */}
        <section className="mb-16 bg-gray-800/50 p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-center text-green-400">Solution Overview</h2>
          <p className="text-lg text-gray-300 text-center max-w-4xl mx-auto">
            {projectInfo.description}
          </p>
        </section>
        
        {/* Features Grid */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center text-green-400">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {essentialFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-green-500/20 hover:scale-105 transition-all duration-300 flex items-start space-x-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-xl mb-1 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold mb-8 text-center text-orange-400">Advanced Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-orange-500/20 hover:scale-105 transition-all duration-300 flex items-start space-x-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-xl mb-1 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Regional & Cultural Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {culturalFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 flex items-start space-x-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-xl mb-1 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Tech Stack Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-green-400">Technology Stack</h2>
          <div className="bg-gray-800/50 p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(techStack).map(([category, technologies]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-lg text-orange-400 mb-1">{category}</h3>
                    <p className="text-gray-300">{technologies}</p>
                  </div>
                ))}
              </div>
          </div>
        </section>

        {/* Admin Button Section */}
        <section className="text-center mt-16">
          <a
            href="/admin"
            className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition-all duration-300 text-lg shadow-lg hover:shadow-blue-500/50"
          >
            Go to Admin Panel
          </a>
        </section>

      </main>

      {/* Footer */}
      <footer className="text-center py-8 mt-12 border-t border-gray-700">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} {projectInfo.teamName}. All rights reserved.</p>
      </footer>
    </div>
  );
}


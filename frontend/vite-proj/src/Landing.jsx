import React, { useState } from 'react';
// Import necessary icons from lucide-react
import { ArrowRight, Database, Shield, Users, BarChart2, Check, UserCircle, Building } from 'lucide-react';

// Import the hook to get the active account from Thirdweb v5 SDK
import { useActiveAccount } from "thirdweb/react";

// Import chain definition (ensure 'thirdweb' package is installed)
import { baseSepolia } from "thirdweb/chains";

// --- Import Child Components ---
// Adjust the path './components/' if your file structure is different
import CreateTaskForm from './components/CreateTaskForm';
import TaskList from './components/TaskList';
// Note: AnnotationView is likely rendered *within* TaskList when a task is selected,
// so it might not need to be directly imported/rendered here unless your structure differs.
// import AnnotationView from './components/AnnotationView';
// --- End Import Child Components ---

// --- Configuration ---
// Using your actual deployed contract addresses on Base Sepolia
export const DATA_DEX_CONTRACT_ADDRESS = "0x72b5fc9eced3157674a187d30c7d36bdad950b9d";
export const DATA_TOKEN_CONTRACT_ADDRESS = "0x9028ACe5350461A50e2F1A810Ec71d10C9eBB3D0"; 
// Define the chain you are working on
export const CHAIN = baseSepolia;
// Define your Thirdweb Client ID (ensure this matches the one in main.jsx)
export const CLIENT_ID = "595d02ef4db520c332937163acaa1009";
// --- End Configuration ---


/**
 * Landing Component
 * - Displays full marketing content if the wallet is disconnected.
 * - Displays role selection or specific dashboard components (CreateTaskForm, TaskList)
 * if the wallet is connected.
 */
const Landing = () => {
  // --- State ---
  const [email, setEmail] = useState(''); // For waitlist form
  const [showRequestorView, setShowRequestorView] = useState(false); // Show requestor component
  const [showAnnotatorView, setShowAnnotatorView] = useState(false); // Show annotator component

  // --- Thirdweb Hook ---
  const account = useActiveAccount(); // Get connected account info
  const address = account?.address; // Extract address

  // --- Handlers ---
  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks for joining! We'll notify ${email} when we launch.`);
    setEmail('');
  };

  // --- Static Content Data ---
  // (Keep your existing data definitions for stats, features, steps, plans, footerLinks)
  const stats = [
    { value: "$15M+", label: "Data exchanged" },
    { value: "10k+", label: "Active annotators" },
    { value: "99.9%", label: "Uptime" }
  ];
  const features = [
    { icon: Shield, title: "Trustless Verification", description: "Our blockchain-based consensus algorithm ensures data annotations meet quality standards without centralized oversight." },
    { icon: Users, title: "Global Annotator Network", description: "Access thousands of skilled annotators worldwide with expertise across various data types and domains." },
    { icon: BarChart2, title: "Real-time Analytics", description: "Monitor your project's progress with comprehensive dashboards showing annotation quality metrics and completion rates." }
  ];
   const steps = [
    { number: 1, title: "Upload Data", description: "Securely upload your data for annotation with customizable privacy settings." },
    { number: 2, title: "Set Parameters", description: "Define annotation guidelines, quality thresholds, and token rewards." },
    { number: 3, title: "Annotators Contribute", description: "Our global network starts annotating your data in a decentralized manner." },
    { number: 4, title: "Receive Quality Data", description: "Download verified annotations or integrate via our API." }
  ];
  // Example pricing plans (replace with your actual data if needed)
  const plans = [
    { name: "Starter", price: "10 DATA", description: "For small projects.", features: ["1GB storage", "Basic tools", "5 projects"], buttonText: "Get Started", buttonClass: "bg-gray-700 hover:bg-gray-600", containerClass: "bg-gray-800 bg-opacity-50 border border-gray-700" },
    { name: "Professional", price: "50 DATA", description: "For growing teams.", features: ["10GB storage", "Advanced tools", "15 projects", "Priority support"], buttonText: "Get Started", buttonClass: "bg-blue-500 hover:bg-blue-600", containerClass: "bg-blue-900 bg-opacity-50 border border-blue-700 transform md:scale-105 z-10", popular: true },
    { name: "Enterprise", price: "Custom", description: "For large scale.", features: ["Unlimited storage", "Premium tools", "Unlimited projects", "Dedicated support"], buttonText: "Contact Sales", buttonClass: "bg-gray-700 hover:bg-gray-600", containerClass: "bg-gray-800 bg-opacity-50 border border-gray-700" }
  ];
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Use Cases', 'Roadmap'],
    Resources: ['Documentation', 'API', 'Community', 'Blog'],
    Company: ['About', 'Careers', 'Press', 'Contact'],
    Legal: ['Terms', 'Privacy', 'Cookies', 'Licenses']
  };


  // --- Conditional Rendering Logic ---

  if (address) {
    // --- RENDER WHEN WALLET IS CONNECTED ---

    // --- Show Requestor View (renders CreateTaskForm) ---
    if (showRequestorView) {
       return (
          <div className="p-6 md:p-10 text-white min-h-[calc(100vh-80px)]"> {/* Adjust min-height */}
             {/* Back Button */}
             <button
                onClick={() => { setShowRequestorView(false); setShowAnnotatorView(false); }}
                className="mb-5 bg-gray-600 hover:bg-gray-700 px-4 py-1.5 rounded text-sm font-medium transition duration-150 ease-in-out shadow hover:shadow-md"
             >
                &larr; Back to Role Selection
             </button>
             {/* View Title */}
             <h1 className="text-3xl font-bold mb-3 text-indigo-300">Requestor Dashboard</h1>
             {/* Connected Wallet Info */}
             <p className="mb-6 text-sm">
                Connected: <span className="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-xs select-all">{address}</span>
             </p>
             {/* Render the CreateTaskForm component */}
             <CreateTaskForm />
          </div>
       );
    }

    // --- Show Annotator View (renders TaskList) ---
    if (showAnnotatorView) {
        return (
           <div className="p-6 md:p-10 text-white min-h-[calc(100vh-80px)]"> {/* Adjust min-height */}
              {/* Back Button */}
              <button
                 onClick={() => { setShowRequestorView(false); setShowAnnotatorView(false); }}
                 className="mb-5 bg-gray-600 hover:bg-gray-700 px-4 py-1.5 rounded text-sm font-medium transition duration-150 ease-in-out shadow hover:shadow-md"
              >
                 &larr; Back to Role Selection
              </button>
              {/* View Title */}
              <h1 className="text-3xl font-bold mb-3 text-blue-300">Annotator Dashboard</h1>
              {/* Connected Wallet Info */}
              <p className="mb-6 text-sm">
                 Connected: <span className="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-xs select-all">{address}</span>
              </p>
              {/* Render the TaskList component */}
              <TaskList />
           </div>
        );
    }

    // --- Default View After Login: Role Selection ---
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-800 to-blue-950 text-white p-8 text-center"> {/* Adjust min-height */}
        <h1 className="text-4xl font-bold mb-4">Welcome to DataDEX!</h1>
        <p className="mb-8 text-lg text-gray-300">
           Wallet Connected: <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded select-all">{address}</span>
        </p>
        <p className="mb-10 text-xl">Choose your role:</p>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Requestor Button */}
          <button
            onClick={() => setShowRequestorView(true)}
            className="bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
          >
            <Building className="mr-3 h-6 w-6" /> Request Annotations
          </button>
          {/* Annotator Button */}
          <button
            onClick={() => setShowAnnotatorView(true)}
            className="bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            <UserCircle className="mr-3 h-6 w-6" /> Perform Annotations
          </button>
        </div>
      </div>
    );

  } else {
    // --- RENDER WHEN WALLET IS DISCONNECTED ---
    // Display the original marketing/landing page content
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        {/* --- Render all the original sections: Hero, Stats, Features, etc. --- */}
        {/* (Code for these sections remains the same as your previous version) */}

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-16 md:py-24">
           {/* Left side content */}
           <div className="md:w-1/2 mb-10 md:mb-0">
             <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
               Decentralized Data Annotation Exchange
             </h1>
             <p className="text-xl mb-8 text-gray-300">
               The first blockchain-powered marketplace where AI projects can seamlessly connect with annotators in a trustless environment.
             </p>
             {/* User Type Buttons (Visual presentation only when disconnected) */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {/* Annotators Card */}
                <div className="bg-blue-900 bg-opacity-70 p-6 rounded-xl border border-blue-700 hover:border-blue-500 transition">
                  <div className="flex items-center mb-3"><UserCircle className="mr-3 text-blue-400 h-8 w-8" /><h3 className="text-xl font-bold">Annotators</h3></div>
                  <p className="text-gray-300 mb-4">Earn tokens by contributing your skills to annotation tasks.</p>
                  {/* Button is disabled as wallet needs to be connected */}
                  <button disabled className="w-full bg-gray-600 opacity-50 cursor-not-allowed transition py-2 rounded-lg font-medium flex items-center justify-center">Start Annotating <ArrowRight className="ml-2 h-5 w-5" /></button>
                </div>
                {/* Firms Card */}
                <div className="bg-indigo-900 bg-opacity-70 p-6 rounded-xl border border-indigo-700 hover:border-indigo-500 transition">
                   <div className="flex items-center mb-3"><Building className="mr-3 text-indigo-400 h-8 w-8" /><h3 className="text-xl font-bold">Firms</h3></div>
                   <p className="text-gray-300 mb-4">Access high-quality annotated data for your AI projects.</p>
                   {/* Button is disabled */}
                   <button disabled className="w-full bg-gray-600 opacity-50 cursor-not-allowed transition py-2 rounded-lg font-medium flex items-center justify-center">Request Data <ArrowRight className="ml-2 h-5 w-5" /></button>
                </div>
             </div>
           </div>
           {/* Optional: Placeholder for an image or animation */}
           {/* <div className="md:w-1/2"> <img src="/path/to/hero-image.png" alt="Data Annotation"/> </div> */}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 md:px-16 py-12 bg-gray-800 bg-opacity-50">
          {stats.map((stat, index) => (
             <div key={index} className="text-center">
               <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
               <p className="text-gray-300">{stat.label}</p>
             </div>
          ))}
        </div>

        {/* Features Section */}
        <div id="features" className="px-8 md:px-16 py-16 md:py-24">
           <h2 className="text-3xl font-bold mb-12 text-center">Why Choose DataDEX?</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {features.map((feature, index) => (
               <div key={index} className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-shadow duration-300">
                 <feature.icon className="text-blue-400 mb-4 h-12 w-12" />
                 <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                 <p className="text-gray-300">{feature.description}</p>
               </div>
             ))}
           </div>
        </div>

        {/* User Types Section */}
        <div className="px-8 md:px-16 py-16 md:py-24 bg-gradient-to-r from-blue-900 to-indigo-900">
           <h2 className="text-3xl font-bold mb-12 text-center">Choose Your Path</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Annotators Details Card */}
              <div className="bg-blue-900 bg-opacity-40 p-8 rounded-xl border border-blue-700 hover:border-blue-500 transition">
                 <div className="flex items-center mb-6"><UserCircle className="mr-4 text-blue-400 h-12 w-12" /><h3 className="text-2xl font-bold">For Annotators</h3></div>
                 <ul className="mb-8 space-y-4">
                    <li className="flex items-start"><Check className="text-blue-400 mr-3 h-5 w-5 mt-1 flex-shrink-0" /><span>Earn crypto tokens for each task completed</span></li>
                    <li className="flex items-start"><Check className="text-blue-400 mr-3 h-5 w-5 mt-1 flex-shrink-0" /><span>Work on diverse projects across multiple domains</span></li>
                    <li className="flex items-start"><Check className="text-blue-400 mr-3 h-5 w-5 mt-1 flex-shrink-0" /><span>Flexible hours and remote work opportunities</span></li>
                    <li className="flex items-start"><Check className="text-blue-400 mr-3 h-5 w-5 mt-1 flex-shrink-0" /><span>Build your reputation with our transparent rating system</span></li>
                 </ul>
                 <button disabled className="w-full bg-gray-600 opacity-50 cursor-not-allowed transition py-3 rounded-lg font-medium flex items-center justify-center">Join as Annotator <ArrowRight className="ml-2 h-5 w-5" /></button>
              </div>
              {/* Firms Details Card */}
              <div className="bg-indigo-900 bg-opacity-40 p-8 rounded-xl border border-indigo-700 hover:border-indigo-500 transition">
                 <div className="flex items-center mb-6"><Building className="mr-4 text-indigo-400 h-12 w-12" /><h3 className="text-2xl font-bold">For Firms</h3></div>
                 <ul className="mb-8 space-y-4">
                    <li className="flex items-start"><Check className="text-indigo-400 mr-3 h-5 w-5 mt-1 flex-shrink-0" /><span>Access a global network of skilled annotators</span></li>
                    <li className="flex items-start"><Check className="text-indigo-400 mr-3 h-5 w-5 mt-1 flex-shrink-0" /><span>Set precise quality requirements and guidelines</span></li>
                    <li className="flex items-start"><Check className="text-indigo-400 mr-3 h-5 w-5 mt-1 flex-shrink-0" /><span>Pay only for verified high-quality annotations</span></li>
                    <li className="flex items-start"><Check className="text-indigo-400 mr-3 h-5 w-5 mt-1 flex-shrink-0" /><span>Scale your annotation pipeline with our enterprise API</span></li>
                 </ul>
                 <button disabled className="w-full bg-gray-600 opacity-50 cursor-not-allowed transition py-3 rounded-lg font-medium flex items-center justify-center">Register Your Firm <ArrowRight className="ml-2 h-5 w-5" /></button>
              </div>
           </div>
        </div>

         {/* How It Works Section */}
        <div id="how-it-works" className="px-8 md:px-16 py-16 md:py-24 bg-gray-800 bg-opacity-30">
           <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
             {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center text-center p-4">
                  <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-4 font-bold text-lg shadow-md">{step.number}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-300 text-sm">{step.description}</p>
                </div>
             ))}
           </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="px-8 md:px-16 py-16 md:py-24">
            <h2 className="text-3xl font-bold mb-12 text-center">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                 <div key={index} className={`p-8 rounded-xl ${plan.containerClass} flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                   {plan.popular && (
                     <div className="bg-blue-500 text-center py-1 px-4 rounded-full text-xs font-bold mb-4 inline-block self-center">MOST POPULAR</div>
                   )}
                   <h3 className="text-xl font-bold mb-2 text-center">{plan.name}</h3>
                   <p className="text-blue-400 text-3xl font-bold mb-6 text-center">{plan.price}</p>
                   <p className="text-gray-300 mb-6 text-sm">{plan.description}</p>
                   <ul className="mb-8 space-y-2 text-sm">
                     {plan.features.map((feature, i) => (
                       <li key={i} className="flex items-center"><Check className="text-blue-400 mr-2 h-4 w-4 flex-shrink-0" /><span>{feature}</span></li>
                     ))}
                   </ul>
                   <div className="flex-grow"></div> {/* Pushes button to bottom */}
                   {/* Disabled button */}
                   <button disabled className={`w-full ${plan.buttonClass} opacity-50 cursor-not-allowed transition py-3 rounded-lg font-medium mt-6`}>
                     {plan.buttonText}
                   </button>
                 </div>
              ))}
            </div>
        </div>

        {/* CTA Section (Waitlist Form) */}
        <div className="px-8 md:px-16 py-16 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Data Annotation Workflow?</h2>
              <p className="text-xl mb-8">
                Join our early access program and receive 100 DATA tokens to kickstart your projects.
              </p>
              {/* Waitlist Form */}
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800 transition duration-150 ease-in-out px-6 py-3 rounded-lg font-medium whitespace-nowrap shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                >
                  Join Waitlist
                </button>
              </form>
            </div>
        </div>

        {/* Footer Section */}
        <footer className="px-8 md:px-16 py-12 bg-gray-900">
           {/* Footer Links */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
             {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h4 className="font-bold mb-4 text-gray-200">{category}</h4>
                  <ul className="space-y-2">
                    {links.map((link, i) => (
                       <li key={i}><a href="#" className="text-gray-400 hover:text-white transition text-sm">{link}</a></li>
                    ))}
                  </ul>
                </div>
             ))}
           </div>
           {/* Bottom Footer */}
           <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
             {/* Logo */}
             <div className="flex items-center mb-4 md:mb-0">
                <Database className="mr-2 text-blue-400 h-5 w-5" /><span className="font-bold text-gray-200">DataDEX</span>
             </div>
             {/* Copyright */}
             <p className="text-gray-400 text-sm">© 2025 DataDEX. All rights reserved.</p>
           </div>
        </footer>

      </div> // End of disconnected state container
    );
  }
};

export default Landing;
"use client"

import React from "react"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
        
        {/* Brand Side */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_#2563eb]" />
            CPGET NUTRITION
          </div>
          <p className="text-slate-500 text-sm max-w-xs">
            Official preparation portal for Nutrition & Dietetics academic excellence.
          </p>
        </div>

        {/* Contact Details Side */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-widest">Contact Us</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">support@cpgetnutrition.com</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Hyderabad, Telangana</span>
            </div>
          </div>
        </div>

      </div>
      
      <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center md:text-left">
        <p className="text-slate-600 text-[10px] uppercase tracking-tighter">
          © {new Date().getFullYear()} • Developed by Abdus Samad • All Rights Reserved
        </p>
      </div>
    </footer>
  )
}
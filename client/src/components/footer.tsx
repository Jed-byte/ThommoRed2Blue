import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin } from "lucide-react";
import { CerosityLogo } from "@/components/cerosity-logo";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <CerosityLogo size={20} />
              </div>
              <span className="text-xl font-bold">Cerosity</span>
            </div>
            <p className="text-gray-300 text-sm">
              Elite mental performance coaching for golfers seeking consistent excellence through proven psychological techniques and AI-powered guidance.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@cerosity.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+971505283505</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Dubai, UAE</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/help" className="hover:text-white transition-colors">Help & FAQ</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>



          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/data-processing" className="hover:text-white transition-colors">Data Processing</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-white transition-colors">Acceptable Use</Link></li>
            </ul>
          </div>

        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © 2025 Cerosity Mental Performance Coaching. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span>Powered by Cero International</span>
            <span>•</span>
            <span>Elite Mental Performance Training</span>
            <span>•</span>
            <span>AI-Enhanced Coaching</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-500 space-y-2">
            <p>
              <strong>Disclaimer:</strong> Cerosity provides mental performance coaching tools and techniques for educational and training purposes. 
              Individual results may vary. This platform is not a substitute for professional psychological counseling or medical advice. 
              If you are experiencing mental health concerns, please consult with a qualified healthcare professional.
            </p>
            <p>
              <strong>Professional Use:</strong> This platform is designed for elite athletes and serious golf competitors seeking mental performance enhancement. 
              The techniques and assessments provided are based on established sports psychology principles and should be used as part of a comprehensive training program.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
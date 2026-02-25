import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Users, CheckCircle, XCircle, Flag } from "lucide-react";

export default function AcceptableUse() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Acceptable Use Policy</h1>
        </div>
        <p className="text-gray-600">
          Last updated: July 09, 2025
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Policy Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            This Acceptable Use Policy governs your use of the Red2Blue mental performance coaching platform. By accessing our services, you agree to use them responsibly and in accordance with these guidelines.
          </p>
          <p className="text-gray-700">
            Red2Blue is designed to support elite golfers and serious competitors in developing their mental game through AI coaching, assessments, and proven techniques. Our community values professionalism, respect, and constructive engagement.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-semibold">
              Our Mission: Create a supportive environment where golfers can safely explore mental performance improvement without judgment or harmful content.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Acceptable Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Platform Features</h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Engage honestly with AI Coach Flo for mental performance guidance</li>
                <li>Complete assessments accurately to receive personalized recommendations</li>
                <li>Share constructive technique ideas with the community</li>
                <li>Use emergency relief tools during genuine stress situations</li>
                <li>Track your progress and mood consistently for better insights</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Community Participation</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Share mental techniques that have genuinely helped your golf performance</li>
                <li>Provide respectful feedback and encouragement to other users</li>
                <li>Contribute to a positive and supportive learning environment</li>
                <li>Maintain anonymity when sharing sensitive mental health topics</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Professional Development</h4>
            <div className="bg-purple-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Use the platform as part of a comprehensive golf training program</li>
                <li>Integrate mental techniques with physical practice and instruction</li>
                <li>Seek professional mental health support when needed</li>
                <li>Respect the educational nature of our coaching content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-600" />
            Prohibited Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Harmful Content</h4>
            <div className="bg-red-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Sharing content that promotes self-harm, violence, or dangerous behavior</li>
                <li>Posting discriminatory, hateful, or harassing messages</li>
                <li>Uploading inappropriate, sexual, or offensive material</li>
                <li>Spreading misinformation about mental health or golf instruction</li>
                <li>Attempting to provide unlicensed psychological counseling</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Platform Misuse</h4>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Creating multiple accounts to circumvent subscription limits</li>
                <li>Sharing account credentials or subscription access</li>
                <li>Attempting to reverse engineer or exploit platform features</li>
                <li>Using automated scripts or bots to interact with AI coaching</li>
                <li>Submitting false or misleading assessment responses</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Commercial Activities</h4>
            <div className="bg-orange-50 p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Selling products or services through the platform</li>
                <li>Recruiting users for competing mental coaching services</li>
                <li>Copying or redistributing proprietary coaching content</li>
                <li>Using the platform for unauthorized marketing or promotion</li>
                <li>Attempting to monetize community-shared techniques</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Special Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Mental Health Boundaries</h4>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                Red2Blue is designed for mental performance enhancement, not clinical mental health treatment.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Do not share detailed personal trauma or mental health crises</li>
                <li>Seek professional help for anxiety, depression, or other mental health conditions</li>
                <li>Use emergency services if you're experiencing thoughts of self-harm</li>
                <li>Understand that AI coaching is not a substitute for therapy</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Competitive Integrity</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                Maintain the integrity of competitive golf and mental performance training.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Use mental techniques within the rules of golf competition</li>
                <li>Don't share techniques designed to gain unfair advantages</li>
                <li>Respect the confidentiality of other players' mental strategies</li>
                <li>Focus on personal improvement rather than undermining competitors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flag className="h-5 w-5 mr-2" />
            Enforcement & Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Violation Consequences</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">First Warning</p>
                  <p className="text-xs text-gray-600">Email notification and account review</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Temporary Suspension</p>
                  <p className="text-xs text-gray-600">7-30 day account suspension</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Permanent Termination</p>
                  <p className="text-xs text-gray-600">Account deletion and service ban</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">How to Report Violations</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                If you encounter content or behavior that violates this policy:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>Email: <a href="mailto:info@cerosity.com" className="text-blue-600 hover:underline">info@cerosity.com</a></li>
                <li>Subject: "Policy Violation Report"</li>
                <li>Include: Date, time, description, and any relevant screenshots</li>
                <li>Response: We'll investigate within 48 hours</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Policy Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            This Acceptable Use Policy may be updated periodically to reflect changes in our platform, community standards, or legal requirements.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-semibold mb-2">
              Notification Process:
            </p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
              <li>Email notification for significant policy changes</li>
              <li>30-day notice period for major updates</li>
              <li>Continued use constitutes acceptance of changes</li>
              <li>Option to cancel subscription if you disagree with updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            If you have questions about this Acceptable Use Policy or need clarification on any restrictions:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>General Questions:</strong> <a href="mailto:info@cerosity.com" className="text-blue-600 hover:underline">info@cerosity.com</a><br />
              <strong>Policy Clarification:</strong> <a href="mailto:legal@red2blue.me" className="text-blue-600 hover:underline">legal@red2blue.me</a><br />
              <strong>Mental Health Resources:</strong> <a href="mailto:wellness@red2blue.me" className="text-blue-600 hover:underline">wellness@red2blue.me</a><br />
              <strong>Response Time:</strong> Within 24 hours for urgent matters
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
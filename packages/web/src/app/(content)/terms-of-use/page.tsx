import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsOfUse() {
  return (
    <main className="container mx-auto px-8 py-16 sm:py-12 md:py-16 max-w-5xl">
      <section className="text-left mb-6 sm:mb-8 relative">
        <Link href="/" passHref>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-12 sm:-top-16 left-0 rounded-full bg-secondary hover:bg-secondary/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight md:max-w-4xl">
          Terms of Use for Shadcn/UI Theme Creator for Chrome
        </h1>
        <p className="text-lg sm:text-xl mb-8 sm:mb-10 md:mb-12 text-muted-foreground">
          By using the Shadcn/UI Theme Creator for Chrome extension, you agree
          to comply with and be bound by the following terms and conditions.
        </p>
      </section>

      <section className="mb-8 p-4 border border-border rounded-lg bg-secondary/50">
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              By using the Shadcn/UI Theme Creator for Chrome extension ("the
              Extension"), you acknowledge that you have read, understood, and
              agree to be bound by these Terms of Use. If you do not agree to
              these terms, please refrain from using the Extension.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              2. Use License
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Felipe Barcelos grants you a personal, non-exclusive,
              non-transferable, revocable license to use the Extension for its
              intended purpose. This license is subject to these Terms of Use
              and does not include the right to modify, distribute, or create
              derivative works of the Extension without explicit permission.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              3. Intellectual Property Rights
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              The Extension, including its code, design, and content, is
              protected by copyright, trademark, and other laws. The Extension
              remains the property of Felipe Barcelos. Our trademarks and trade
              dress may not be used in connection with any product or service
              without prior written consent.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              4. Limitations
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              You may not use the Extension for any illegal or unauthorized
              purpose. You agree to comply with all local laws regarding online
              conduct and acceptable content. You are solely responsible for
              your use of the Extension.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              5. Disclaimer of Warranties
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              The Extension is provided "as is" without any warranties,
              expressed or implied. Felipe Barcelos does not warrant that the
              Extension will be error-free or uninterrupted. You use the
              Extension at your own risk.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Felipe Barcelos shall not be liable for any indirect, incidental,
              special, consequential or punitive damages resulting from your use
              of or inability to use the Extension.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              7. Changes to Terms
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Felipe Barcelos reserves the right to modify these Terms of Use at
              any time. We will notify users of any material changes by posting
              the new Terms of Use on this page. Your continued use of the
              Extension after any such changes constitutes your acceptance of
              the new Terms of Use.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              8. Governing Law
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              These Terms shall be governed by and construed in accordance with
              the laws of Brazil, without regard to its conflict of law
              provisions.
            </p>
          </div>

          <div className="bg-secondary/10 p-6 sm:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              9. Contact Information
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4">
              If you have any questions about these Terms of Use, please contact
              us:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-200 p-4 rounded-lg flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mb-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:felipebarcelospro@gmail.com"
                  className="text-base font-semibold text-center"
                >
                  felipebarcelospro@gmail.com
                </a>
              </div>
              <div className="bg-gray-200 p-4 rounded-lg flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mb-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <a
                  href="https://github.com/felipebarcelospro/drift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-center"
                >
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center mt-8 sm:mt-12">
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </main>
  );
}

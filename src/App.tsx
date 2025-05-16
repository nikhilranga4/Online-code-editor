import { ThemeProvider } from '@/components/theme-provider';
import { MainCodeEditor } from '@/components/main-code-editor';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthPrompt } from '@/components/auth/auth-prompt';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthCallback } from '@/pages/auth-callback';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark">
          <Routes>
            <Route path="/" element={
              <main className="min-h-screen bg-background">
                <MainCodeEditor />
                <Toaster />
                <AuthPrompt />
              </main>
            } />
            <Route path="/auth/callback/github" element={<AuthCallback />} />
            <Route path="/auth/callback/google" element={<AuthCallback />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, Shield } from "lucide-react";

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title = "NOVERIS", breadcrumbs }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Logo and navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {breadcrumbs && (
                <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center">
                      {index > 0 && <span className="mx-2">›</span>}
                      {crumb.href ? (
                        <a href={crumb.href} className="hover:text-foreground transition-colors">
                          {crumb.label}
                        </a>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-right">
              <p className="font-medium text-foreground">Sarah Johnson</p>
              <p className="text-muted-foreground">sarah@company.com</p>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground">SJ</AvatarFallback>
            </Avatar>
          </div>
          
          <Button variant="ghost" size="sm">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
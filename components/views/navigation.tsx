'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { Heart, Home, LogOut, Settings } from "lucide-react";

export function Navigation() {

    return (
        <div className="fixed bottom-3 right-0 left-0 z-[10000]">
            <div className="flex justify-center ">
                <div className="flex items-center justify-around p-4  shadow-custom-elevated rounded-[230px] w-[90%] max-w-[450px] bg-secondary/100 backdrop-blur supports-[backdrop-filter]:bg-secondary/100">
                    <Button variant="ghost" size="icon" className="text-background hover:text-secondary-foreground" asChild>
                        <Link href="/">
                            <Home className="h-6 w-6" />
                        </Link>
                    </Button>
                    <Button variant="ghost" className="text-background hover:text-secondary-foreground" size="icon">
                        <Heart className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-background hover:text-secondary-foreground" asChild>
                        <Link href="/settings">
                            <Settings className="h-6 w-6" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-background hover:text-secondary-foreground" asChild>
                        <Link href="/login">
                            <LogOut className="h-6 w-6" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

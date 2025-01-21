import { TopMenu } from '@/components/views/top-menu';
import { Navigation } from '@/components/views/navigation';


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <TopMenu />
            {children}
            <Navigation />
        </>
    );
}
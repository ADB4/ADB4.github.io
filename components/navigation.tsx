import Link from 'next/link';

import ThemeToggle from './themetoggle';
import { useTheme } from 'next-themes'
import { useDeviceContext } from '../context/devicecontext';
import { usePathname } from 'next/navigation'
const Navigation: React.FC = () => {
    const compactView = useDeviceContext();
    const pathname = usePathname();
    // const compactView = useDeviceContext();
    const navMatStyle: React.CSSProperties = {
        backgroundColor: 'var(--backlight)',
    };


    const trapezoidStyle: React.CSSProperties = {
        backgroundColor: 'var(--nav-primary)',
        marginBottom: compactView ? '2.0rem' : '0rem',
    };

    const navItemStyle: React.CSSProperties = {
        backgroundColor: 'var(--nav-item-primary)',
        color: 'var(--nav-item-text)'
    };

    const gradientLight: React.CSSProperties = {
        boxShadow: 'inset -1px 10px 5px -11px var(--nav-highlight)'
    };
    return (
        <>
        <div className="navigation-section">
            <div className="nav-container-outer compact liquid-glass" style={trapezoidStyle}>
                <nav className="nav-container-inner compact liquid-glass-main">
                    <div className="nav-gradient-light compact"
                        style={gradientLight}/>
                    <div className="nav-gradient-shadow compact"/>
                    <div className="nav-interface compact">
                        <div className="nav-center-interface">
                            <div className="nav-center-display">
                                <Link className={pathname === '/' ? 'nav-item-option selected' : 'nav-item-option inactive'}
                                        href="/"
                                >
                                    <p>HOME</p>
                                </Link>
                                <Link className={pathname === '/projects' ? 'nav-item-option selected' : 'nav-item-option inactive'}
                                        href="/"
                                >
                                    <p>PROJECTS [COMING SOON]</p>
                                </Link>
                                <Link className={pathname === '/weblog' ? 'nav-item-option selected' : 'nav-item-option inactive'}
                                        href="/"
                                >
                                    <p>WRITING [COMING SOON]</p>
                                </Link>
                                <Link className={pathname === '/contact' ? 'nav-item-option selected' : 'nav-item-option inactive'}
                                        href="/"
                                >
                                    <p>CONTACT [COMING SOON]</p>
                                </Link>
                            </div>
                            <div className="nav-center-input">
                                <div className="nav-item-mat-col">
                                <button className="nav-center-up liquid-glass"
                                        style={navItemStyle}
                                >
                                    <div className="nav-item-shell">
                                        <div className="shell-line-top"/>
                                        <div className="shell-circle"/>
                                        <div className="shell-line-bottom"/>
                                    </div>
                                    <p>PREV</p>
                                </button>
                                <button className="nav-center-down liquid-glass"
                                        style={navItemStyle}
                                >
                                    <div className="nav-item-shell">
                                        <div className="shell-line-top"/>
                                        <div className="shell-circle"/>
                                        <div className="shell-line-bottom"/>
                                    </div>
                                    <p>NEXT</p>
                                </button>
                                </div>

                            </div>
                        </div>
                        <div className="nav-theme-container">
                            <ThemeToggle /> 
                            <div className="nav-theme-labels">
                                <div className="nav-indicator-row">
                                    <div className="nav-indicator-light"/>
                                    <p>LIGHT</p>
                                </div>
                                <div className="nav-indicator-row">
                                    <div className="nav-indicator-dark"/>
                                    <p>DARK</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </nav>
                <div className="nav-container-outer-shadow"/>
            </div>
        </div>
        </>
    );
}

/*
        {!compactView && (
        <div className="navigation">
            <nav className="nav-container liquid-glass-main">
                <div className="nav-gradient-light"
                    style={gradientLight}/>
                <div className="nav-gradient-shadow"/>
                <div className="nav-container-inner">
                    <div className="nav-container-interface">
                        <div className="nav-item-mat" style={navMatStyle}>
                            <Link className="nav-item-single liquid-glass" 
                                href="/"
                                style={navItemStyle}>
                                <div className="nav-item-dimple-left"/>
                                <p>/</p>
                                <div className="nav-item-dimple-right"/>
                            </Link>
                        </div>
                        <div className="nav-item-mat" style={navMatStyle}>
                            <Link className="nav-item-left liquid-glass" 
                                href="/"
                                style={navItemStyle}>
                                    <div className="nav-item-shell">
                                        <div className="shell-line-x line-right"/>
                                       <div className="shell-line-x line-left"/>
                                        <div className="shell-circle shell-right"/>
                                        <div className="shell-circle shell-left"/>
                                    </div>
                                    <p>ARBEIT</p>
                            </Link>
                            <Link className="nav-item-center liquid-glass" 
                                href="/"
                                style={navItemStyle}>
                                    <div className="nav-item-shell">
                                        <div className="shell-line-x line-right"/>
                                       <div className="shell-line-x line-left"/>
                                        <div className="shell-circle shell-right"/>
                                        <div className="shell-circle shell-left"/>
                                    </div>
                                    <p>SCHREIBEN</p>
                            </Link>
                            <Link className="nav-item-right liquid-glass" 
                                href="/"
                                style={navItemStyle}>
                                    <div className="nav-item-shell">
                                        <div className="shell-line-x line-right"/>
                                       <div className="shell-line-x line-left"/>
                                        <div className="shell-circle shell-right"/>
                                        <div className="shell-circle shell-left"/>
                                    </div>
                                    <p>KONTAKT</p>
                            </Link>
                        </div>
                        <div className="nav-theme-indicator">
                            <div className="nav-indicator-row">
                                <div className="nav-indicator-light"/>
                                <p>LIGHT</p>
                            </div>
                            <div className="nav-indicator-row">
                                <div className="nav-indicator-dark"/>
                                <p>DARK</p>
                            </div>
                        </div>
                        <div className="nav-item-mat"
                            style={{margin: "auto", marginRight: "0.25rem", backgroundColor: "var(--backlight)"}}>
                            <ThemeToggle />
                        </div>
                    </div>

                </div>
            </nav>
            <div className="trapezoid liquid-glass" style={trapezoidStyle}>
                <div className="trapezoid-shadow"/>
            </div>
        </div>  
        )}
*/
export default Navigation;
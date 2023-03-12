import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  DiscordIcon,
  MenuCloseIcon,
  MenuOpenIcon,
  MGIcon,
  TwitterIcon,
} from "./svgIcons";

export default function Header(props: {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link href="/">
            <a>
              <div className="logo">
                {/* eslint-disable-next-line */}
                <img src="/img/logo.svg" alt="" />
              </div>
            </a>
          </Link>
        </div>
        <div className="header-right">
          <nav>
            <ul>
              <li>
                <Link href="/home">
                  <a className="active">Home</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="">Park</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="">funky map</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="">white paper</a>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="social-links">
            <ul>
              <li>
                <Link href="https://magiceden.com">
                  <a>
                    <div>
                      <MGIcon />
                    </div>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="https://magiceden.com">
                  <a>
                    <div>
                      <TwitterIcon />
                    </div>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="https://magiceden.com">
                  <a>
                    <div>
                      <DiscordIcon />
                    </div>
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mobile-menu">
          <button className="hamburger" onClick={() => setOpen(!open)}>
            {!open ? <MenuOpenIcon /> : <MenuCloseIcon />}
          </button>
          {open && (
            <div className="mobile-nav">
              <nav>
                <ul>
                  <li>
                    <Link href="/">
                      <a className="active">Home</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/">
                      <a className="">Park</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/">
                      <a className="">funky map</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/">
                      <a className="">white paper</a>
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className="social-links">
                <ul>
                  <li>
                    <Link href="https://magiceden.com">
                      <a>
                        <div>
                          <MGIcon />
                        </div>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="https://magiceden.com">
                      <a>
                        <div>
                          <TwitterIcon />
                        </div>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="https://magiceden.com">
                      <a>
                        <div>
                          <DiscordIcon />
                        </div>
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

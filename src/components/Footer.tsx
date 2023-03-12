/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <ul>
        {/* <li>
          <Link href="/term-conditions">
            <a>Terms and Conditions</a>
          </Link>
        </li> */}
        <li>
          <p>© 2022 FunkyLIamas</p>
        </li>
        {/* <li>
          <Link href="/policy">
            <a>Privacy Policy</a>
          </Link>
        </li> */}
      </ul>
      <img src="/img/footer-img.png" alt="" />
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 bg-neutral-cream border-b border-neutral-gray-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-h4 font-bold text-neutral-gray-900">MediTime</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/my-medicines"
              className={`text-body transition-colors ${
                isActive('/my-medicines')
                  ? 'text-primary font-semibold'
                  : 'text-neutral-gray-600 hover:text-primary'
              }`}
            >
              내 약
            </Link>
            <Link
              href="/medicines/search"
              className={`text-body transition-colors ${
                isActive('/medicines')
                  ? 'text-primary font-semibold'
                  : 'text-neutral-gray-600 hover:text-primary'
              }`}
            >
              약 검색
            </Link>
            <Link
              href="/education"
              className={`text-body transition-colors ${
                isActive('/education')
                  ? 'text-primary font-semibold'
                  : 'text-neutral-gray-600 hover:text-primary'
              }`}
            >
              교육
            </Link>
          </nav>

          {/* User Menu */}
          <Link href="/mypage" className="btn-outline btn-sm">
            <UserIcon className="w-5 h-5" />
            <span>마이페이지</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

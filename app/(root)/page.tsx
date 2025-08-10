import { Collection } from '@/components/shared/Collection'
import { navLinks } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Home = ({searchParams}: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || '';
  return (
    <>
    <section className='home'>
      <h1 className='home-heading'>
        asdfghjkluioingioetn
      </h1>
      <ul className='flex-center lg:gap-20 gap-10'>
        {navLinks.slice(1,5).map((link)=>(
          <Link 
          key={link.route}
          href={link.route}
          className='flex-center flex-col gap-2'>
          <li className='rounded-full bg-white p-4'>
            <Image 
            src={link.icon}
            alt=""
            width={24} height={24}
            className='' />
          </li>
          <p className='text-white'>{link.label}</p>
          </Link>
        ))}
      </ul>
    </section>

    <section>
      <Collection/>
    </section>
    </>
  )
}

export default Home

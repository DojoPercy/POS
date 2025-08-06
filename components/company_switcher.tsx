import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';

type Company = {
  id: string;
  name: string;
  logo?: string;
};

type CompanySwitcherProps = {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
};

export function CompanySwitcher({
  companies,
  selectedCompany,
  onSelectCompany,
}: CompanySwitcherProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-[200px] justify-between'
        >
          {selectedCompany ? (
            <div className='flex items-center'>
              {selectedCompany.logo && (
                <Image
                  width={20}
                  height={20}
                  src={selectedCompany.logo || '/placeholder.svg'}
                  alt={selectedCompany.name}
                  className='w-10  mr-2 rounded-full'
                  unoptimized
                />
              )}
              {selectedCompany.name}
            </div>
          ) : (
            'Select company...'
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandInput placeholder='Search company...' />
          <CommandList>
            <CommandEmpty>No company found.</CommandEmpty>
            {companies.length === 1 ? (
              <CommandItem
                key={companies[0].id}
                onSelect={() => {
                  onSelectCompany(companies[0]);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedCompany?.id === companies[0].id
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
                <div className='flex items-center'>
                  {companies[0].logo && (
                    <Image
                      src={companies[0].logo || '/placeholder.svg'}
                      alt={companies[0].name}
                      className='w-5 h-5 mr-2 rounded-full'
                    />
                  )}
                  {companies[0].name}
                </div>
              </CommandItem>
            ) : (
              companies.map(company => (
                <CommandItem
                  key={company.id}
                  onSelect={() => {
                    onSelectCompany(company);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedCompany?.id === company.id
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <div className='flex items-center'>
                    {company.logo && (
                      <Image
                        src={company.logo || '/placeholder.svg'}
                        alt={company.name}
                        className='w-5 h-5 mr-2 rounded-full'
                      />
                    )}
                    {company.name}
                  </div>
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

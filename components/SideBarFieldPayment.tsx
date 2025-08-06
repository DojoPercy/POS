import Icon from './Icon';

export default function SideBarFieldPayment({
  data,
  label,
  columnName,
  iconName,
  iconProp,
  iconViewbox = '0 0 512 512',
  loading,
}: {
  data: any;
  label: string;
  columnName?: string;
  iconName: string;
  iconProp: string;
  iconViewbox?: string;
  loading: boolean;
}) {
  return (
    <div className='mt-8 w-full rounded-sm bg-zinc-200 text-zinc-500 py-2 focus-within:!text-zinc-900 pointer-events-none'>
      <div className='flex flex-row mb-0.5 w-full border-b-2 border-b-zinc-300 px-3.5 pb-2'>
        <span className='my-auto mr-1.5'>
          <Icon name={iconName} prop={iconProp} viewbox={iconViewbox} />
        </span>
        <span className='my-auto font-semibold'>{label}</span>
      </div>
      {!loading &&
        Object.keys(data).length !== 0 &&
        data[columnName ? columnName : label].map((row: any, i: number) => (
          <div
            className='flex px-3.5 py-1.5 min-h-[32px] text-zinc-900 border-b-2 border-b-zinc-300 w-full'
            key={i}
          >
            <div className='mr-auto my-auto justify-start flex w-1/3'>
              {row.paymentDate.split(', ')[0]}
            </div>
            <div className='ml-auto my-auto justify-end flex w-2/3'>
              <span className='my-auto w-3/5 text-left pl-2 pr-2 border-l-2 border-l-zinc-300'>
                {row.paymentDate.split(', ')[1]}
              </span>
              <span className='my-auto w-2/5 text-right border-l-2 border-l-zinc-300'>
                {Intl.NumberFormat('id').format(row.amount)}
              </span>
            </div>
          </div>
        ))}
      <div className='flex flex-col w-full h-16 px-3.5'>
        <div className='flex w-full h-8'>
          <span className='mr-auto my-auto'>Total:</span>
          <span className='ml-auto my-auto'>
            {!loading && Object.keys(data).length !== 0
              ? Intl.NumberFormat('id').format(data.paymentTotal)
              : '0'}
          </span>
        </div>
        <div className='flex w-full h-8'>
          <span className='mr-auto my-auto'>Remaining:</span>
          <span className='ml-auto my-auto'>
            {!loading && Object.keys(data).length !== 0
              ? Intl.NumberFormat('id').format(
                data.orderTotal - data.paymentTotal,
              )
              : '0'}
          </span>
        </div>
      </div>
      <div className='border-t-zinc-300 flex w-full h-8 border-t-2'>
        <button
          type='button'
          className='flex my-auto mx-auto w-[95%] h-[90%] rounded-sm pointer-events-auto hover:bg-zinc-300 focus:bg-zinc-200 focus:!text-zinc-500'
          disabled={loading || !data}
        >
          <span className='my-auto mx-auto'>Edit payment record</span>
        </button>
      </div>
    </div>
  );
}

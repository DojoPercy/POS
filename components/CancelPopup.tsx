export default function CancelPopup({
  text,
  noCancel,
  yesCancel,
}: {
  text: string;
  noCancel: any;
  yesCancel: any;
}) {
  return (
    <div className='fixed top-0  bottom-0 left-0 right-0 flex items-center bg-zinc-400 bg-opacity-80'>
      <div className='my-auto mx-auto flex flex-col w-full md:w-[400px] h-[200px] bg-white rounded-md'>
        <span className='my-auto px-8 py-3.5 text-lg'>{text}</span>
        <div className='flex flex-row h-1/3 px-8 py-2.5 border-t-2 border-t-zinc-200 justify-end text-sm'>
          <button
            type='button'
            className='my-auto mr-5 rounded-sm text-zinc-900 font-medium px-5 py-2.5 hover:bg-zinc-200'
            onClick={noCancel}
          >
            No
          </button>
          <button
            type='button'
            className='my-auto mr-5 rounded-sm text-white bg-red-500 font-medium px-12 py-2.5 hover:bg-red-400'
            onClick={yesCancel}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

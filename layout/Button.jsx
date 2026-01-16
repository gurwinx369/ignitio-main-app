export const Button = ({ name, onClick }) => {
    return (
        <div className="button">
            <button
                onClick={onClick}
                className="cursor-pointer transition-all text-white px-6 py-2 rounded-lg border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-base font-semibold"
                style={{
                    backgroundColor: 'var(--color-accent)',
                    borderColor: 'var(--color-accent-700)'
                }}
            >
                {name}
            </button>
        </div>
    )
}

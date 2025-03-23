
interface GuideTicketsListProps {
  guides: Array<{
    guideName: string;
    guideType: string;
    ticketType: "adult" | "child" | null;
  }>;
}

export const GuideTicketsList = ({ guides }: GuideTicketsListProps) => {
  if (guides.length === 0) return null;
  
  return (
    <div className="mt-1 text-xs text-muted-foreground">
      {guides.map((guide, idx) => (
        <div key={idx} className="flex justify-between items-center py-0.5">
          <span className="truncate max-w-[65%]">{guide.guideName}</span>
          <span className="text-xs text-muted-foreground">
            {guide.ticketType ? `${guide.ticketType} ticket` : "No ticket"}
          </span>
        </div>
      ))}
    </div>
  );
};

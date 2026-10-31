const nav = [
  {
    id: 1,
    name: "Dashboard",
  },
  {
    id: 2,
    name: "Users",
  },
  {
    id: 3,
    name: "News",
  },
];

const Sidebar = () => {
  return (
    <div className="max-w-80 h-screen bg-blue-950 p-4">
      <div className="flex flex-col gap-10 ">
        {nav.map((item) => (
          <div
            key={item.id}
            className="text-white p-2  bg-yellow-100/20 hover:bg-yellow-100/50"
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
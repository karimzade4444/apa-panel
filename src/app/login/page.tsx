

const Page = () => {
  return (
    <div className="w-full h-screen">
      <div className=" flex  items-center gap-20 ">
        <div className="bg-white w-[50%] h-screen">
          <h1 className="w-full h-screen flex justify-center items-center text-3xl font-black tracking-widest">
            Добро пожаловать!
          </h1>
        </div>
        <div className="bg-blue-950 h-screen w-[55%]">
          <div className="w-full h-screen flex justify-center items-center">
            <div className=" flex flex-col gap-5 justify-center ">
              <h1 className="text-2xl font-black ">
                Войдите если у вас есть учетный запись
              </h1>
              <input
                type="text"
                placeholder="Введите Логин"
                className="border-2 border-black"
              />
              <input
                type="password"
                placeholder="Введите пароль"
                className="border-2 border-black"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page
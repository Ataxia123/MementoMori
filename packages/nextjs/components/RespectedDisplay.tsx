const RespectedDisplay = (props: any) => {
  const { respected } = props;

  return (
    <>
      <div className="border-2 border-gray-500 card mt-6 ml-10 mr-10 text-center text-white font-mono text-xl">
        <>
          {" "}
          💀 Memento Mori 💀
          {!respected || respected.equipped_items.length <= 1 ? (
            <div>{respected?.name} </div>
          ) : (
            <div>
              <br />
              <span className="font-bold text-2xl">{respected?.name}</span> <br />
              <span className="font-bold">
                Level {respected?.level} <span>{respected?.race}</span>
                <span> {respected?.class}</span>{" "}
              </span>
              <br />
              ---------------------
              <br />
              {respected?.equipped_items?.map((item: any) => (
                <div key={item.slot.type}>
                  {item.quality.type == "POOR" ? (
                    <span className="text-gray-500"> {item.name.en_US}</span>
                  ) : (
                    <>
                      {item.quality.type == "COMMON" ? (
                        <span className="text-white"> {item.name.en_US}</span>
                      ) : (
                        <>
                          {item.quality.type == "UNCOMMON" ? (
                            <span className="text-green-500"> {item.name.en_US}</span>
                          ) : (
                            <>
                              {item.quality.type == "RARE" ? (
                                <span className="text-blue-500"> {item.name.en_US}</span>
                              ) : (
                                <>
                                  {item.quality.type == "EPIC" ? (
                                    <span className="text-purple-500"> {item.name.en_US}</span>
                                  ) : (
                                    <span className="text-orange-500"> {item.name.en_US}</span>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      </div>
      <br />
    </>
  );
};

export default RespectedDisplay;

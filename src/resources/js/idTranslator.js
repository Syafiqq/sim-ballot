export class IDTranslator {
  constructor () {
  }

  static translate (number) {
    let sentence = '';
    const ones = ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
    const letter = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
    const thousand = ['', 'Ribu', 'Juta', 'Milyar', 'Triliun'];
    const numLength = number.length;

    if (numLength > 15) {
      sentence = "Diluar Batas";
    } else {
      for (i = 1; i <= numLength; i++) {
        ones[i] = number.substr(-(i), 1);
      }

      var i = 1;
      let j = 0;

      let substr, let1, let2, let3;
      while (i <= numLength) {
        substr = "";
        let1 = "";
        let2 = "";
        let3 = "";

        if (ones[i + 2] !== "0") {
          if (ones[i + 2] === "1") {
            let1 = "Seratus";
          } else {
            let1 = `${letter[ones[i + 2]]} Ratus`;
          }
        }

        if (ones[i + 1] !== "0") {
          if (ones[i + 1] === "1") {
            if (ones[i] === "0") {
              let2 = 'Sepuluh';
            } else if (ones[i] === "1") {
              let2 = 'Sebelas';
            } else {
              let2 = `${letter[ones[i]]} Belas`;
            }
          } else {
            let2 = `${letter[ones[i + 1]]} Puluh`;
          }
        }

        if (ones[i] !== "0") {
          if (ones[i + 1] !== "1") {
            let3 = letter[ones[i]];
          }
        }

        if ((ones[i] !== "0") || (ones[i + 1] !== "0") || (ones[i + 2] !== "0")) {
          substr = [let1, let2, let3, thousand[j]].filter(Boolean).join(" ");
        }

        sentence = substr + sentence;
        i = i + 3;
        j = j + 1;
      }

      if ((ones[5] === "0") && (ones[6] === "0")) {
        sentence = sentence.replace("Satu Ribu", "Seribu");
      }
    }
    return sentence;
  }
}

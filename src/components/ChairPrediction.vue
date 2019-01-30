<template lang="pug">
  div
    b-modal(ref='settingsModal', v-model='modalState' hide-header='')
      b-form(horizontal='')
        b-form-group(horizontal='' label='Partai', label-for='form-party')
          b-form-select#form-party(v-model='party', :options='parties')
        b-form-group(horizontal='' label='Kabupaten', label-for='form-district')
          b-form-input#form-district(type='text', v-model='district', required='', placeholder='Masukkan Nama Kabupaten', autocomplete="nope")
        b-form-group(horizontal='' label='Dapil', label-for='form-area')
          b-form-input#form-area(type='text', v-model='area', required='', placeholder='Masukkan Nama Dapil', autocomplete="nope")
        b-form-group(horizontal='' label='Jumlah Kursi', label-for='form-alloc')
          b-form-input#form-alloc(type='number', v-model.lazy='ranks', required='', placeholder='Masukkan Jumlah Kursi', @input="calculateAllocation()")
      .w-100(slot='modal-footer')
        b-button-group
          b-dropdown.float-left(size='sm', variant='primary', right='', split='', text='Download Laporan XLS', @click='downloadReportXls()')
            b-dropdown-item(size='sm', variant='primary', @click='downloadReportPdf()') Download PDF
        b-btn.float-right(size='sm', variant='danger', @click='modalState=false') Close
      div
    b-table(responsive='', bordered='', outlined='', hover='', small='', :items='sItems', :fields='sFields')
      template(slot='party', slot-scope='data')
        .d-flex.justify-content-between
          span.pr-3 {{data.value}}
          b-badge(v-if="data.item.alloc > 0", variant='primary', style="width:2.5em") {{data.item.alloc}}
          div(v-else='')
      template(slot='ballot', slot-scope='data')
        input.form-control-sm(type='number', style='width:8em', v-model.lazy='data.item.ballot', @change="onBallotChange($event,data.item)")
      template(slot='detail', slot-scope='data')
        b-badge(v-for="d in data.value", variant='info', style="width:2.5em; margin:0 8px")
          span.font-xl {{d}}
    fab(:actions="[]" main-icon='settings', @click.native="openSettings")
</template>

<script>
import {ConfigRepository} from "@/resources/js/repositories/config-repository";
import fab from 'vue-fab'


export default {
  name: "ChairPrediction",
  components: {
    fab
  },
  data () {
    return {
      parties: [],
      party: '',
      district: '',
      area: '',
      items: [],
      fields: [],
      numSplit: 0,
      ranks: 0,
      modalState: true,
      total: 0,
      process: []
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    async fetch () {
      const {parties, num_ranks, total_ranks} = await ConfigRepository.get();
      this.numSplit = num_ranks;
      this.ranks = total_ranks;
      this.parties = parties;
      this.party = this.parties[0];
      this.mergeFields();
      this.createParties(parties, num_ranks);
      window._.forEach(this.sItems, x => this.onBallotChange(null, x))
    },
    mergeFields () {
      let vm = this;
      let fields = [{
        key: 'no',
        label: 'No',
        thStyle: {width: '50px'}
      }, {
        key: 'party',
        label: 'Partai',
        thStyle: {width: '150px'},
        tdClass: ['text-uppercase', 'bg-party']
      }, {
        key: 'ballot',
        label: 'Suara',
        thStyle: {width: '100px'},
        tdClass: ['bg-ballot']
      }, {
        key: 'detail',
        label: 'Alokasi Kursi',
      }];
      while (vm.fields.length > 0) {
        vm.fields.pop();
      }
      window._.forEach(fields, (value) => {
        vm.fields.push(value);
      })
    },
    createParties (parties, ranks) {
      let vm = this;
      const max = parties.length * ranks * 10;
      while (vm.items.length > 0) {
        vm.items.pop();
      }
      window._.forEach(parties, (v, k) => {
        let item = {
          no: k + 1,
          party: v,
          ballot: 0,
          alloc: 0,
          detail: [],
          c: {}
        };
        window._.forEach(window._.range(1, ranks + 1), (value) => {
          item.c[`r${value}`] = {
            rank: value,
            position: max,
            position_display: max,
            value: 0,
          };
        });
        vm.items.push(item)
      })
    },
    onRanksChange () {
      while (this.process.length > 0) {
        this.process.pop()
      }
      window._.forEach(this.sItems, (v, k) => {
        let x = -1;
        window._.forEach(v.c, (v1, k1) => this.process.push({
          b: v1.value,
          s0: k,
          s1: ++x,
          s2: k1,
        }))
      });
      //sort value
      let dr = 0, vr = Number.MIN_SAFE_INTEGER;
      let proc = window._.sortBy(this.process, x => -x.b, x => x.s1, x => x.s0);
      while (this.process.length > 0) {
        this.process.pop()
      }
      while (proc.length > 0) {
        this.process.unshift(proc.pop())
      }
      window._.forEach(this.process, (v, k) => {
        if (v.b !== vr) {
          vr = v.b;
          dr = k + 1
        }
        this.items[v.s0]['c'][v.s2]['position'] = k + 1;
        this.items[v.s0]['c'][v.s2]['position_display'] = dr;
      });
      this.calculateAllocation();
    },
    calculateAllocation () {
      let max = this.sItems.length * this.numSplit;
      if (this.ranks > (max))
        this.ranks = max;
      if (this.ranks < 0)
        this.ranks = 0;
      window._.forEach(this.sItems, v => {
        let col = window._.filter(v.c, x => x.position <= this.cRanks);
        v.alloc = col.length;
        v.detail = window._.map(col, x => x.position_display);
      })
    },
    onBallotChange (e, v) {
      window._.forEach(v.c, (v1) => {
        v1.value = Number(Math.round(v.ballot / (v1.rank * 2 - 1)));
      });
      this.total = 0;
      window._.forEach(this.sItems, x => this.total += x.ballot);
      this.onRanksChange();
    },
    openSettings () {
      this.$refs.settingsModal.show()
    },
    translate (n) {
      if (n === 1) {
        return 'Pertama';
      } else {
        return `Ke${window.IDT.translate(n.toString()).toLowerCase()}`
      }
    },
    downloadReportPdf () {
      const vm = this;
      let d = (t, b = false, s = 10, p = 0) => {
        return {text: t, fontSize: s, bold: b, alignment: p === 0 ? 'left' : (p === 1 ? 'center' : 'right')}
      };
      const gtwk2 = () => {
        let ar = [];
        ar.push([d('NO', true, 12, 1), d('KURSI', true, 12, 1), d('PARTAI', true, 12, 1)]);
        let n = vm.cRanks;
        while (--n >= 0) {
          ar.push([d(vm.cRanks - n, false, 12, 2), d(`Kursi ${vm.translate(vm.cRanks - n)}`, false, 12, 0), d(vm.items[vm.process[vm.cRanks - n - 1].s0].party, false, 12, 0)]);
        }
        ar.push([
          {text: 'Total', fontSize: 12, bold: true, alignment: 'left', colSpan: 2},
          {},
          d(0, false, 12, 2)]);
        ar.push([
          {text: 'Kursi', fontSize: 12, bold: true, alignment: 'left', colSpan: 2},
          {},
          d(vm.cRanks, false, 12, 2)]);
        return {
          widths: [25, '*', '*'],
          body: ar
        }
      };
      const gtwk1 = (_t) => {
        let ar = [];
        ar.push([d('NO', true, 12, 1), d('PARTAI POLITIK', true, 12, 1), d('JUMLAH PEROLEAHAN SUARA', true, 12, 1), d('PEROLEHAN KURSI SAINTE LAGUE', true, 12, 1), d('PESEBARAN URUTAN', true, 12, 1)]);
        window._.forEach(vm.sItems, (v, k) => {
          ar.push([d(k + 1, false, 12, 2), d(`${v.party}`, false, 12, 0), d(Number(v.ballot), false, 12, 2), d((v.alloc >= 1 && v.alloc <= vm.cRanks) ? v.alloc : '-', false, 12, 2), d((v.detail == null || v.detail.length <= 0) ? '-' : window._.join(v.detail, ', '), false, 12, 2)]);
        });
        ar.push([
          {text: 'Total', fontSize: 12, bold: true, alignment: 'left', colSpan: 2},
          {},
          d(_t.ballots + "", false, 12, 2),
          d(vm.cRanks + "", false, 12, 2),
          d(window._.join(window._.sortBy(window._.concat(window._.flatten(window._.map(vm.sItems, x => x.detail || [])))), ', ') || '-', false, 12, 2)]);
        return {
          widths: [25, 150, 120, 120, '*'],
          body: ar
        }
      };
      let temp = {
        ballots: 0,
        c: {},
      };
      window._.forEach(vm.sItems, (v) => {
        temp.ballots += Number(v.ballot);
        window._.forEach(v.c, (v1, k1) => {
          if (!(k1 in temp.c))
            temp.c[k1] = 0;
          if (v1.position <= vm.cRanks) {
            ++temp.c[k1];
          }
        });
      });
      let docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [60, 40, 40, 40],
        compress: false,
        info: {
          title: 'Laporan',
          author: 'SIM Pemilukada',
          subject: 'Laporan SIM Pemilukada',
          keywords: 'Laporan SIM Pemilukada',
          creator: 'SIM Pemilukada',
          producer: 'SIM Pemilukada',
        },
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 10, 0, 0]
          },
          subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5]
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black'
          }
        },
        content: [
          {
            table: {
              widths: [100, 150],
              body: [
                [d('Partai', true), d(vm.party)],
                [d('Kabupaten', true), d(vm.district)],
                [d('Dapil', true), d(vm.area)],
                [d('Alokasi Kursi', true), d(vm.cRanks)]
              ]
            }
          },
          {text: ' ', style: 'header'},
          {
            table: gtwk1(temp)
          },
          {text: '', pageOrientation: 'portrait', pageBreak: 'after'},
          {
            table: {
              widths: [100, 150],
              body: [
                [d('Partai', true), d(vm.party)],
                [d('Kabupaten', true), d(vm.district)],
                [d('Dapil', true), d(vm.area)],
                [d('Alokasi Kursi', true), d(vm.cRanks)]
              ]
            }
          },
          {text: ' ', style: 'header'},
          {
            table: gtwk2(temp)
          },
        ]
      };
      const pdfDocGenerator = window.pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        window.FileSaver.saveAs(blob, `${docDefinition.info.title}.pdf`);
      });
    },
    downloadReportXls () {
      let __scale = x => x * 1.1;
      let __jumpChar = (c, n = 1) => {
        let r = c;
        while (--n >= 0) {
          r = __nextChar(r)
        }
        return r;
      };
      let __nextChar = c => {
        if (c === '') {
          return 'A';
        }
        const u = c.toUpperCase();
        if (same(u, 'Z')) {
          let txt = '';
          let i = u.length;
          while (i--) {
            txt += 'A';
          }
          return (txt + 'A');
        } else {
          let p = "";
          let q = "";
          if (u.length > 1) {
            p = u.substring(0, u.length - 1);
            q = String.fromCharCode(p.slice(-1).charCodeAt(0));
          }
          const l = u.slice(-1).charCodeAt(0);
          const z = nextLetter(l);
          if (z === 'A') {
            return p.slice(0, -1) + nextLetter(q.slice(-1).charCodeAt(0)) + z;
          } else {
            return p + z;
          }
        }
      };
      let nextLetter = l => {
        if (l < 90) {
          return String.fromCharCode(l + 1);
        } else {
          return 'A';
        }
      };
      let same = (str, char) => {
        let i = str.length;
        while (i--) {
          if (str[i] !== char) {
            return false;
          }
        }
        return true;
      };

      const vm = this;
      let workbook = new window.ExcelJS.Workbook();
      let col = 'A';
      let row = 0;
      let n = vm.numSplit;
      let temp = {
        ballots: 0,
        c: {},
      };
      window._.forEach(vm.sItems, (v) => {
        temp.ballots += Number(v.ballot);
        window._.forEach(v.c, (v1, k1) => {
          if (!(k1 in temp.c))
            temp.c[k1] = 0;
          if (v1.position <= vm.cRanks) {
            ++temp.c[k1];
          }
        });
      });

      // Worksheet
      let worksheet = workbook.addWorksheet('SUMMARY 1');
      col = 'A';
      row = 0;
      worksheet.getColumn(col).width = __scale(3.5);
      worksheet.getColumn(col = __nextChar(col)).width = __scale(15.54);
      worksheet.getColumn(col = __nextChar(col)).width = __scale(25.06);
      worksheet.getColumn(col = __nextChar(col)).width = __scale(15.71);
      worksheet.getColumn(col = __nextChar(col)).width = __scale(40);

      window._.forEach([['Partai', vm.party], ['Kabupaten', vm.district], ['Dapil', vm.area], ['Alokasi Kursi', vm.cRanks]], x => {
        ++row;
        worksheet.mergeCells(`A${row}:B${row}`);
        worksheet.getCell(`A${row}:B${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
        worksheet.getCell(`A${row}`).font = {bold: true};
        worksheet.getCell(`A${row}`).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
        worksheet.getCell(`A${row}`).value = x[0];
        worksheet.getCell(`C${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
        worksheet.getCell(`C${row}`).font = {bold: true};
        worksheet.getCell(`C${row}`).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
        worksheet.getCell(`C${row}`).value = x[1];
        worksheet.getCell(`C${row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {argb: 'FFFABF8F'},
        };
      });

      worksheet.getRow(5).height = __scale(21.75);
      worksheet.getRow(6).height = __scale(25.4);

      row += 2;
      col = '';
      window._.forEach(['NO', 'PARTAI POLITIK', 'JUMLAH PEROLEHAN SUARA', 'Perolehan Kursi SAINTE LAGUE', 'PESEBARAN URUTAN'], x => {
        col = __nextChar(col);
        worksheet.mergeCells(`${col}${row}:${col}${row + 1}`);
        worksheet.getCell(`${col}${row}`).font = {bold: true};
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'center', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = x;
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
      });

      ++row;
      window._.forEach(vm.sItems, (v, k) => {
        ++row;
        col = '';
        col = __nextChar(col);

        worksheet.getRow(row).height = __scale(15);
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = k + 1;
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
        col = __nextChar(col);
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = `${v.party}`;
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };

        col = __nextChar(col);
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'right', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = Number(v.ballot);
        worksheet.getCell(`${col}${row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {argb: 'FFFABF8F'},
        };
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };

        col = __nextChar(col);
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'right', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = (v.alloc >= 1 && v.alloc <= vm.cRanks) ? v.alloc : '-';
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };

        col = __nextChar(col);
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'right', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = (v.detail == null || v.detail.length <= 0) ? '-' : window._.join(v.detail, ', ');
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
      });

      ++row;
      col = '';
      col = __nextChar(col);
      worksheet.mergeCells(`${col}${row}:${__nextChar(col)}${row}`);
      worksheet.getCell(`${col}${row}:${__nextChar(col)}${row}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };
      worksheet.getCell(`${col}${row}`).font = {bold: true};
      worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
      worksheet.getCell(`${col}${row}`).value = 'Total';

      col = __jumpChar(col, 2);
      worksheet.getCell(`${col}${row}`).font = {bold: true};
      worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', wrapText: true};
      worksheet.getCell(`${col}${row}`).value = temp.ballots;
      worksheet.getCell(`${col}${row}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };

      col = __nextChar(col);
      worksheet.getCell(`${col}${row}`).font = {bold: true};
      worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'right', wrapText: true};
      worksheet.getCell(`${col}${row}`).value = vm.cRanks;
      worksheet.getCell(`${col}${row}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };

      col = __nextChar(col);
      worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'right', wrapText: true};
      worksheet.getCell(`${col}${row}`).value = window._.join(window._.sortBy(window._.concat(window._.flatten(window._.map(vm.sItems, x => x.detail || [])))), ', ') || '-';
      worksheet.getCell(`${col}${row}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };

      // Worksheet
      worksheet = workbook.addWorksheet('SUMMARY 2');
      col = 'A';
      row = 0;
      worksheet.getColumn(col).width = __scale(3.5);
      worksheet.getColumn(col = __nextChar(col)).width = __scale(25.06);
      worksheet.getColumn(col = __nextChar(col)).width = __scale(25.06);

      window._.forEach([['Partai', vm.party], ['Kabupaten', vm.district], ['Dapil', vm.area], ['Alokasi Kursi', vm.cRanks]], x => {
        ++row;
        worksheet.mergeCells(`A${row}:B${row}`);
        worksheet.getCell(`A${row}:B${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
        worksheet.getCell(`A${row}`).font = {bold: true};
        worksheet.getCell(`A${row}`).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
        worksheet.getCell(`A${row}`).value = x[0];
        worksheet.getCell(`C${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
        worksheet.getCell(`C${row}`).font = {bold: true};
        worksheet.getCell(`C${row}`).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
        worksheet.getCell(`C${row}`).value = x[1];
        worksheet.getCell(`C${row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {argb: 'FFFABF8F'},
        };
      });

      worksheet.getRow(5).height = __scale(21.75);
      worksheet.getRow(6).height = __scale(25.4);

      row += 2;
      col = '';
      window._.forEach(['NO', 'KURSI', 'PARTAI'], x => {
        col = __nextChar(col);
        worksheet.mergeCells(`${col}${row}:${col}${row + 1}`);
        worksheet.getCell(`${col}${row}`).font = {bold: true};
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'center', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = x;
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
      });
      ++row;

      n = vm.cRanks;
      while (--n >= 0) {
        ++row;
        col = '';
        col = __nextChar(col);

        worksheet.getRow(row).height = __scale(15);
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = vm.cRanks - n;
        worksheet.getCell(`${col}${row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {argb: 'FFFFFF00'},
        };
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
        col = __nextChar(col);
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = `Kursi ${vm.translate(vm.cRanks - n)}`;
        worksheet.getCell(`${col}${row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {argb: 'FFFFFF00'},
        };
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };

        col = __nextChar(col);
        worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', wrapText: true};
        worksheet.getCell(`${col}${row}`).value = vm.items[vm.process[vm.cRanks - n - 1].s0].party;
        worksheet.getCell(`${col}${row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {argb: 'FF00b050'},
        };
        worksheet.getCell(`${col}${row}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
      }

      ++row;
      col = '';
      col = __nextChar(col);
      worksheet.mergeCells(`${col}${row}:${__nextChar(col)}${row}`);
      worksheet.getCell(`${col}${row}:${__nextChar(col)}${row}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };
      worksheet.getCell(`${col}${row}`).font = {bold: true};
      worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
      worksheet.getCell(`${col}${row}`).value = 'Total';

      col = __jumpChar(col, 2);
      worksheet.getCell(`${col}${row}`).font = {bold: true};
      worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'right', wrapText: true};
      worksheet.getCell(`${col}${row}`).value = 0;
      worksheet.getCell(`${col}${row}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };

      ++row;
      col = '';
      col = __nextChar(col);
      worksheet.mergeCells(`${col}${row}:${__nextChar(col)}${row}`);
      worksheet.getCell(`${col}${row}:${__nextChar(col)}${row}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };
      worksheet.getCell(`${col}${row}`).font = {bold: true};
      worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'left', wrapText: true};
      worksheet.getCell(`${col}${row}`).value = 'Kursi';

      col = __jumpChar(col, 2);
      worksheet.getCell(`${col}${row}`).font = {bold: true};
      worksheet.getCell(`${col}${row}`).alignment = {vertical: 'middle', horizontal: 'right', wrapText: true};
      worksheet.getCell(`${col}${row}`).value = vm.cRanks;
      worksheet.getCell(`${col}${row}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };

      let path = 'Laporan.xlsx';
      let mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      workbook.xlsx.writeBuffer()
        .then(function (data) {
          let blob = new Blob([data], {type: mimeType});
          window.FileSaver.saveAs(blob, path);
        });
    }
  },
  computed: {
    sFields () {
      return this.fields
    },
    sItems () {
      return this.items
    },
    cNumSplit () {
      return window._.map(window._.range(1, this.numSplit + 1), x => `c.r${x}`);
    },
    cRanks () {
      return this.ranks;
    }
  },
}

</script>

<style scoped>

</style>
